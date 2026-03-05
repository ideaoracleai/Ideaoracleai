import i18n from '../i18n';
import { supabase } from '../supabase/config';

export interface AIResponse {
  content: string;
  rating: 'good' | 'medium' | 'bad';
}

/**
 * Calls the Supabase Edge Function `chat-ai` which securely proxies to OpenAI.
 * The OpenAI API key lives ONLY on the server — never exposed to the browser.
 */
export async function generateDemoResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  images?: string[]  // base64 data URLs for vision
): Promise<AIResponse> {
  const language = i18n.language.split('-')[0]; // 'en-US' -> 'en'

  // Build messages array for OpenAI
  const messages = [
    ...conversationHistory.map(m => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    // Get current user session token for auth
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/functions/v1/chat-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ messages, language, images }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Edge function HTTP error:', response.status, errText);
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();

    return {
      content: data.content || 'No response generated.',
      rating: data.rating || 'medium',
    };
  } catch (err) {
    console.error('Failed to call AI:', err);

    // Fallback error response in user's language
    const fallbackMessages: Record<string, string> = {
      en: 'I apologize, but I\'m temporarily unable to process your request. Please try again in a moment.',
      de: 'Entschuldigung, ich kann Ihre Anfrage vorübergehend nicht bearbeiten. Bitte versuchen Sie es in einem Moment erneut.',
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