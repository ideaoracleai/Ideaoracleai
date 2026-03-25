import i18n from '../i18n';
import { supabase } from '../supabase/config';

export interface AIResponse {
  content: string;
  rating: 'good' | 'medium' | 'bad';
  model?: string;
}

/** Settings shape that the admin AI settings editor persists to localStorage */
interface StoredAISettings {
  settings?: {
    strictness?: number;
    creativity?: number;
    realism?: number;
    detailLevel?: number;
    tone?: string;
    responseLength?: string;
    focusAreas?: string[];
    customInstructions?: string;
    autoRating?: boolean;
    showSources?: boolean;
    maxTokens?: number;
    language?: string;
  };
  activePresets?: string[];
  model?: string; // model key e.g. 'gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-2.0-flash'
}

const AI_SETTINGS_KEY = 'admin_ai_settings';

/**
 * Read admin AI settings from localStorage (set via Admin → KI-Einstellungen).
 * Returns the settings to send to the edge function, or undefined if not configured.
 */
function getAdminAISettings(): Record<string, unknown> | undefined {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    if (!raw) return undefined;

    const stored: StoredAISettings = JSON.parse(raw);
    if (!stored.settings && !stored.model) return undefined;

    // Build the settings object the edge function expects
    const s = stored.settings || {};
    return {
      strictness: s.strictness,
      creativity: s.creativity,
      realism: s.realism,
      detailLevel: s.detailLevel,
      tone: s.tone,
      responseLength: s.responseLength,
      focusAreas: s.focusAreas,
      customInstructions: s.customInstructions,
      autoRating: s.autoRating,
      showSources: s.showSources,
      maxTokens: s.maxTokens,
      model: stored.model,
    };
  } catch {
    return undefined;
  }
}

/**
 * Calls the Supabase Edge Function `chat-ai` which securely proxies to
 * OpenAI / Anthropic / Google Gemini depending on admin settings.
 * The API keys live ONLY on the server — never exposed to the browser.
 */
export async function generateDemoResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  images?: string[]  // base64 data URLs for vision
): Promise<AIResponse> {
  const language = i18n.language.split('-')[0]; // 'en-US' -> 'en'

  // Limit history to last 8 messages to prevent token overflow on long conversations
  const recentHistory = conversationHistory.slice(-8);

  // Build messages array
  const messages = [
    ...recentHistory.map(m => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  // Read admin AI settings (presets, model, strictness etc.)
  const aiSettings = getAdminAISettings();

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    // Get current user session token for auth
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || supabaseAnonKey;

    // Longer timeout for Thinking model (blueprints), shorter for standard/fast
    const isThinkingModel = aiSettings?.model === 'ideaoracle-thinking';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), isThinkingModel ? 60000 : 30000);

    let response: Response;
    try {
      response = await fetch(`${supabaseUrl}/functions/v1/chat-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          messages,
          language,
          images,
          aiSettings,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('Edge function HTTP error:', response.status, errText);
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();

    return {
      content: data.content || 'No response generated.',
      rating: data.rating || 'medium',
      model: data.model,
    };
  } catch (err) {
    console.error('Failed to call AI:', err);

    // Fallback error response in user's language
    const fallbackMessages: Record<string, string> = {
      en: "I apologize, but I'm temporarily unable to process your request. Please try again in a moment.",
      de: 'Entschuldigung, ich kann Ihre Anfrage vorübergehend nicht bearbeiten. Bitte versuchen Sie es in einem Moment erneut.',
      fr: "Je m'excuse, mais je suis temporairement incapable de traiter votre demande. Veuillez réessayer dans un moment.",
      es: 'Lo siento, pero temporalmente no puedo procesar tu solicitud. Por favor, inténtalo de nuevo en un momento.',
      it: 'Mi scuso, ma temporaneamente non riesco a elaborare la tua richiesta. Per favore riprova tra un momento.',
      pt: 'Peço desculpas, mas temporariamente não consigo processar sua solicitação. Por favor, tente novamente em um momento.',
      nl: 'Mijn excuses, maar ik kan uw verzoek tijdelijk niet verwerken. Probeer het over een moment opnieuw.',
      pl: 'Przepraszam, ale tymczasowo nie mogę przetworzyć Twojego żądania. Spróbuj ponownie za chwilę.',
      ru: 'Извините, но я временно не могу обработать ваш запрос. Пожалуйста, попробуйте через минуту.',
      ar: 'أعتذر، لكنني غير قادر مؤقتاً على معالجة طلبك. يرجى المحاولة مرة أخرى بعد لحظة.',
      hi: 'क्षमा करें, लेकिन मैं अस्थायी रूप से आपके अनुरोध को संसाधित करने में असमर्थ हूँ। कृपया कुछ क्षणों में पुनः प्रयास करें।',
      ja: '申し訳ございませんが、一時的にリクエストを処理できません。しばらくしてからもう一度お試しください。',
      ko: '죄송합니다만, 일시적으로 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      zh: '抱歉，我暂时无法处理您的请求。请稍后再试。',
      tr: 'Özür dilerim, ancak isteğinizi geçici olarak işleyemiyorum. Lütfen biraz sonra tekrar deneyin.',
      th: 'ขออภัย แต่ฉันไม่สามารถประมวลผลคำขอของคุณได้ชั่วคราว กรุณาลองอีกครั้งในอีกสักครู่',
      vi: 'Xin lỗi, nhưng tôi tạm thời không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau giây lát.',
      id: 'Maaf, tetapi saya sementara tidak dapat memproses permintaan Anda. Silakan coba lagi sebentar lagi.',
      sv: 'Jag ber om ursäkt, men jag kan tillfälligt inte behandla din förfrågan. Försök igen om en stund.',
      no: 'Beklager, men jeg kan midlertidig ikke behandle forespørselen din. Vennligst prøv igjen om et øyeblikk.',
      sq: 'Më falni, por përkohësisht nuk mund ta përpunoj kërkesën tuaj. Ju lutemi provoni përsëri pas një momenti.',
    };

    return {
      content: fallbackMessages[language] || fallbackMessages.en,
      rating: 'medium',
    };
  }
}

export function getRatingEmoji(rating: 'good' | 'medium' | 'bad'): string {
  switch (rating) {
    case 'good': return '✅';
    case 'medium': return '⚠️';
    case 'bad': return '❌';
  }
}

export function getRatingLabel(rating: 'good' | 'medium' | 'bad'): string {
  const key = `rating.${rating}`;
  return i18n.t(key);
}