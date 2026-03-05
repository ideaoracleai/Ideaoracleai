import i18n from '../i18n';

export interface AIResponse {
  content: string;
  rating: 'good' | 'medium' | 'bad';
}

interface ResponseTemplate {
  keywords: string[];
  responses: Record<string, AIResponse[]>; // Multi-language support
}

interface AISettings {
  analysisStyle: string;
  tone: string;
  detailLevel: number;
  strictness: number;
  creativity: number;
  realism: number;
  responseLength: 'kurz' | 'mittel' | 'lang';
  focusAreas: string[];
  customInstructions: string;
  language: string;
  autoRating: boolean;
  showSources: boolean;
  maxTokens: number;
}

const STORAGE_KEY = 'admin_ai_settings';

// Load AI settings from localStorage
function loadAISettings(): AISettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.settings || null;
    }
  } catch (e) {
    console.error('Failed to load AI settings:', e);
  }
  return null;
}

const responseTemplates: Record<string, ResponseTemplate> = {
  findNiche: {
    keywords: ['nische finden', 'profitable niche', 'find niche', 'niche ideas', 'geschäftsidee', 'business idea', 'profitable', 'rentable', 'lucrative', 'найти нишу', '找到利基', 'ニッチを見つける', '틈새 찾기'],
    responses: {
      de: [
        {
          content: `Hier sind 3 profitable Nischen mit Potenzial:

**1. KI-gestützte Produktivitätstools für Remote-Teams**
- Marktgröße: Stark wachsend (Remote-Arbeit bleibt)
- Wettbewerb: Mittel, aber Raum für Spezialisierung
- Monetarisierung: SaaS-Modell, 15-50€/Monat
- ✅ **Bewertung: Gut** – Hohe Nachfrage, klare Zahlungsbereitschaft

**2. Nachhaltige Haustierpflege-Produkte**
- Marktgröße: 2,5 Mrd. € in DACH-Region
- Wettbewerb: Niedrig bei Premium-Segment
- Monetarisierung: E-Commerce, Abo-Boxen
- ⚠️ **Bewertung: Mittel** – Gute Nische, aber Logistik-intensiv

**3. Micro-Learning-Plattformen für Fachkräfte**
- Marktgröße: Wachsend (Weiterbildung boomt)
- Wettbewerb: Hoch, aber Spezialisierung möglich
- Monetarisierung: Kurse, Zertifikate, B2B-Lizenzen
- ✅ **Bewertung: Gut** – Skalierbar, wiederkehrende Einnahmen

**Mein Tipp:** Starte mit Nische 1 oder 3 – beide sind digital, skalierbar und haben klare Zielgruppen.`,
          rating: 'good'
        }
      ],
      en: [
        {
          content: `Here are 3 profitable niches with potential:

**1. AI-powered Productivity Tools for Remote Teams**
- Market size: Strongly growing (remote work is here to stay)
- Competition: Medium, but room for specialization
- Monetization: SaaS model, $15-50/month
- ✅ **Rating: Good** – High demand, clear willingness to pay

**2. Sustainable Pet Care Products**
- Market size: $3B in target region
- Competition: Low in premium segment
- Monetization: E-commerce, subscription boxes
- ⚠️ **Rating: Average** – Good niche, but logistics-intensive

**3. Micro-Learning Platforms for Professionals**
- Market size: Growing (upskilling boom)
- Competition: High, but specialization possible
- Monetization: Courses, certificates, B2B licenses
- ✅ **Rating: Good** – Scalable, recurring revenue

**My tip:** Start with niche 1 or 3 – both are digital, scalable, and have clear target audiences.`,
          rating: 'good'
        }
      ]
    }
  },
  evaluateIdea: {
    keywords: ['bewerte', 'evaluate', 'meinung', 'opinion', 'was hältst du', 'what do you think', 'idee', 'idea', 'оцени', '评估', '評価', '평가'],
    responses: {
      de: [
        {
          content: `Ich bewerte deine Idee ehrlich:

**Positive Aspekte:**
- Das Problem ist real und relevant
- Zielgruppe ist klar definiert
- Grundsätzlich monetarisierbar

**Kritische Punkte:**
- Wettbewerb ist bereits stark in diesem Bereich
- Differenzierung ist nicht klar erkennbar
- Skalierbarkeit könnte problematisch sein

**Konkrete Risiken:**
- Customer Acquisition Cost könnte zu hoch sein
- Zahlungsbereitschaft der Zielgruppe unklar
- Technische Komplexität wird unterschätzt

⚠️ **Bewertung: Mittel** – Die Idee hat Potenzial, braucht aber deutliche Schärfung.

**Meine Empfehlung:**
1. Nische weiter eingrenzen (kleinere, spezifischere Zielgruppe)
2. Unique Value Proposition definieren
3. MVP mit 1-2 Kernfeatures starten
4. Zahlungsbereitschaft früh testen

Möchtest du die Idee gemeinsam schärfen?`,
          rating: 'medium'
        }
      ],
      en: [
        {
          content: `I'll evaluate your idea honestly:

**Positive aspects:**
- The problem is real and relevant
- Target audience is clearly defined
- Fundamentally monetizable

**Critical points:**
- Competition is already strong in this area
- Differentiation is not clearly visible
- Scalability could be problematic

**Concrete risks:**
- Customer Acquisition Cost might be too high
- Target audience's willingness to pay unclear
- Technical complexity is underestimated

⚠️ **Rating: Average** – The idea has potential but needs significant sharpening.

**My recommendation:**
1. Narrow down the niche further (smaller, more specific target audience)
2. Define Unique Value Proposition
3. Start with MVP with 1-2 core features
4. Test willingness to pay early

Would you like to sharpen the idea together?`,
          rating: 'medium'
        }
      ]
    }
  },
  sharpenNiche: {
    keywords: ['schärfen', 'sharpen', 'spezifischer', 'specific', 'eingrenzen', 'narrow down', 'fokus', 'focus', 'уточнить', '完善', '絞り込む', '다듬다'],
    responses: {
      de: [
        {
          content: `Lass uns deine Nische schärfen:

**Aktuell (zu breit):**
"Online-Kurse für Unternehmer"

**Geschärft (besser):**
"5-Tages-Intensivkurse für Solo-Selbstständige im Dienstleistungsbereich, die ihren ersten Mitarbeiter einstellen wollen"

**Warum ist das besser?**
1. **Zielgruppe präzise:** Solo → erstes Team
2. **Zeitrahmen klar:** 5 Tage (nicht monatelang)
3. **Konkretes Problem:** Mitarbeiter-Einstellung
4. **Branche definiert:** Dienstleistung

**Weitere Schärfung möglich:**
- Geografisch: DACH-Region
- Branche: z.B. nur Coaches/Berater
- Unternehmensgröße: 50-150k Jahresumsatz

✅ **Bewertung: Gut** – Je spezifischer, desto besser dein Marketing und desto höher die Conversion.

**Nächster Schritt:** Definiere 3-5 konkrete Schmerzpunkte dieser Zielgruppe.`,
          rating: 'good'
        }
      ],
      en: [
        {
          content: `Let's sharpen your niche:

**Current (too broad):**
"Online courses for entrepreneurs"

**Sharpened (better):**
"5-day intensive courses for solo service providers who want to hire their first employee"

**Why is this better?**
1. **Target audience precise:** Solo → first team
2. **Timeframe clear:** 5 days (not months)
3. **Concrete problem:** Employee hiring
4. **Industry defined:** Services

**Further sharpening possible:**
- Geographic: Specific region
- Industry: e.g., only coaches/consultants
- Company size: $50-150k annual revenue

✅ **Rating: Good** – The more specific, the better your marketing and the higher the conversion.

**Next step:** Define 3-5 concrete pain points of this target audience.`,
          rating: 'good'
        }
      ]
    }
  },
  trends: {
    keywords: ['trends', 'aktuell', 'current', 'jetzt', 'now', 'potential', 'potenzial', 'zukunft', 'future', 'тренды', '趋势', 'トレンド', '트렌드'],
    responses: {
      de: [
        {
          content: `**Top-Trends mit Business-Potenzial (2024/2025):**

**1. KI-Integration in bestehende Workflows**
- Nicht "noch eine KI-App", sondern KI als Feature
- Beispiel: KI-Assistent für Steuerberater
- ✅ Potenzial: Sehr hoch

**2. Klimaneutralität für KMUs**
- Software + Beratung für CO2-Bilanzierung
- Regulatorischer Druck steigt
- ✅ Potenzial: Hoch (B2B!)

**3. Mentale Gesundheit am Arbeitsplatz**
- Tools für Burnout-Prävention
- B2B-Verkauf an HR-Abteilungen
- ⚠️ Potenzial: Mittel (Compliance-Themen)

**4. Hyper-lokale Services**
- Plattformen für Nachbarschafts-Dienstleistungen
- Gegen Amazon/Uber-Monopole
- ⚠️ Potenzial: Mittel (Netzwerkeffekte schwer)

**5. No-Code-Automatisierung**
- Tools für Nicht-Techniker
- Prozessautomatisierung ohne IT
- ✅ Potenzial: Sehr hoch

**Mein Favorit:** KI-Integration (Trend 1) – Jede Branche braucht das, Zahlungsbereitschaft ist da.`,
          rating: 'good'
        }
      ],
      en: [
        {
          content: `**Top Trends with Business Potential (2024/2025):**

**1. AI Integration into Existing Workflows**
- Not "another AI app", but AI as a feature
- Example: AI assistant for accountants
- ✅ Potential: Very high

**2. Carbon Neutrality for SMEs**
- Software + consulting for CO2 accounting
- Regulatory pressure increasing
- ✅ Potential: High (B2B!)

**3. Mental Health in the Workplace
- Tools for burnout prevention
- B2B sales to HR departments
- ⚠️ Potential: Medium (compliance issues)

**4. Hyper-local Services**
- Platforms for neighborhood services
- Against Amazon/Uber monopolies
- ⚠️ Potential: Medium (network effects difficult)

**5. No-Code Automation**
- Tools for non-technical users
- Process automation without IT
- ✅ Potential: Very high

**My favorite:** AI Integration (Trend 1) – Every industry needs it, willingness to pay is there.`,
          rating: 'good'
        }
      ]
    }
  },
  general: {
    keywords: [],
    responses: {
      de: [
        {
          content: `Interessante Frage! Lass mich das aus Nischen-Perspektive beantworten:

**Grundsätzlich gilt:**
- Eine gute Nische löst ein spezifisches Problem
- Die Zielgruppe muss erreichbar und zahlungsbereit sein
- Du brauchst einen unfairen Vorteil (Zugang, Know-how, Technologie)

**Meine Empfehlung:**
Starte mit einer sehr engen Nische und erweitere später. Lieber 100 begeisterte Kunden als 10.000 gleichgültige.

⚠️ **Bewertung: Mittel** – Deine Frage ist noch zu allgemein. Erzähl mir mehr über:
- Deine Skills/Erfahrung
- Verfügbares Budget
- Zeitrahmen
- Zielgruppe, die du kennst

Dann kann ich dir konkretere Empfehlungen geben.`,
          rating: 'medium'
        }
      ],
      en: [
        {
          content: `Interesting question! Let me answer from a niche perspective:

**Generally speaking:**
- A good niche solves a specific problem
- The target audience must be reachable and willing to pay
- You need an unfair advantage (access, know-how, technology)

**My recommendation:**
Start with a very narrow niche and expand later. Better 100 enthusiastic customers than 10,000 indifferent ones.

⚠️ **Rating: Average** – Your question is still too general. Tell me more about:
- Your skills/experience
- Available budget
- Timeframe
- Target audience you know

Then I can give you more concrete recommendations.`,
          rating: 'medium'
        }
      ]
    }
  }
};

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();

  for (const [intent, template] of Object.entries(responseTemplates)) {
    if (template.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return intent;
    }
  }

  return 'general';
}

function getRandomResponse(responses: AIResponse[]): AIResponse {
  return responses[Math.floor(Math.random() * responses.length)];
}

function applyAISettings(baseResponse: string, settings: AISettings | null, rating: 'good' | 'medium' | 'bad'): AIResponse {
  if (!settings) {
    return { content: baseResponse, rating };
  }

  let modifiedContent = baseResponse;
  let modifiedRating = rating;

  // Apply custom instructions
  if (settings.customInstructions.trim()) {
    const instructionNote = `\n\n**[Hinweis: ${settings.customInstructions}]**`;
    modifiedContent = baseResponse + instructionNote;
  }

  // Apply strictness - affects rating
  if (settings.strictness >= 80) {
    // Very strict - downgrade ratings
    if (rating === 'good') modifiedRating = 'medium';
    if (rating === 'medium') modifiedRating = 'bad';
  } else if (settings.strictness <= 30) {
    // Very lenient - upgrade ratings
    if (rating === 'bad') modifiedRating = 'medium';
    if (rating === 'medium') modifiedRating = 'good';
  }

  // Apply tone modifications
  const toneModifiers: Record<string, string> = {
    'direkt': '\n\n**Direkt gesagt:** ',
    'ehrlich': '\n\n**Ehrlich betrachtet:** ',
    'motivierend': '\n\n**Positiv formuliert:** ',
    'freundlich': '\n\n**Freundlicher Hinweis:** ',
    'akademisch': '\n\n**Analytisch betrachtet:** ',
  };

  if (settings.tone && settings.tone !== 'professionell' && toneModifiers[settings.tone]) {
    const tonePrefix = toneModifiers[settings.tone];
    const toneSuffix = getToneSuffix(settings.tone);
    modifiedContent = modifiedContent + tonePrefix + toneSuffix;
  }

  // Apply response length
  if (settings.responseLength === 'kurz') {
    modifiedContent = modifiedContent.split('\n\n').slice(0, 3).join('\n\n') + '\n\n*(Kurzfassung - für Details frag gerne nach)*';
  } else if (settings.responseLength === 'lang') {
    modifiedContent = modifiedContent + '\n\n**Zusätzliche Details:** Ich kann jeden dieser Punkte noch detaillierter ausführen. Frag einfach nach!';
  }

  // Apply focus areas
  if (settings.focusAreas.length > 0) {
    const focusNote = `\n\n**Meine Schwerpunkte:** ${settings.focusAreas.map(a => getFocusAreaLabel(a)).join(', ')}`;
    modifiedContent = modifiedContent + focusNote;
  }

  // Apply realism level
  if (settings.realism >= 80) {
    modifiedContent = modifiedContent + '\n\n**Realitätscheck:** Diese Einschätzung basiert auf aktuellen Marktdaten und realistischen Annahmen.';
  } else if (settings.realism <= 30) {
    modifiedContent = modifiedContent + '\n\n**Kreative Perspektive:** Hier sind auch unkonventionelle Ansätze möglich!';
  }

  // Apply creativity level
  if (settings.creativity >= 80) {
    modifiedContent = modifiedContent + '\n\n💡 **Out-of-the-box Idee:** Hast du schon an völlig andere Ansätze gedacht?';
  }

  // Remove rating if autoRating is disabled
  if (!settings.autoRating) {
    // Use alternation instead of character class to avoid combined character errors
    modifiedContent = modifiedContent.replace(/(?:✅|⚠️|❌)\s*\*\*Bewertung:.*?\*\*/g, '');
    modifiedContent = modifiedContent.replace(/(?:✅|⚠️|❌)\s*\*\*Rating:.*?\*\*/g, '');
  }

  return {
    content: modifiedContent,
    rating: settings.autoRating ? modifiedRating : rating
  };
}

function getToneSuffix(tone: string): string {
  const suffixes: Record<string, string> = {
    'direkt': 'Keine Umschweife - das sind die Fakten.',
    'ehrlich': 'So sieht die Realität aus, ohne Beschönigung.',
    'motivierend': 'Du hast definitiv Potenzial hier! Lass uns das gemeinsam angehen.',
    'freundlich': 'Ich bin hier, um dich zu unterstützen. Gemeinsam finden wir den besten Weg!',
    'akademisch': 'Diese Analyse folgt bewährten Business-Frameworks und Marktforschung.',
  };
  return suffixes[tone] || '';
}

function getFocusAreaLabel(areaId: string): string {
  const labels: Record<string, string> = {
    'marktanalyse': 'Marktanalyse',
    'wettbewerb': 'Wettbewerb',
    'monetarisierung': 'Monetarisierung',
    'risiken': 'Risiken',
    'finanzen': 'Finanzen',
    'skalierung': 'Skalierung',
    'innovation': 'Innovation',
    'trends': 'Trends',
    'differenzierung': 'Differenzierung',
    'umsetzung': 'Umsetzung',
    'zielgruppe': 'Zielgruppe',
    'marketing': 'Marketing',
  };
  return labels[areaId] || areaId;
}

function addContextAwareness(response: string, previousMessages: string[], language: string): string {
  if (previousMessages.length === 0) return response;

  // Add contextual intro if it's a follow-up
  if (previousMessages.length > 2) {
    const contextIntros: Record<string, string[]> = {
      de: [
        'Basierend auf unserer bisherigen Diskussion: ',
        'Um auf deine vorherige Frage zurückzukommen: ',
        'Ergänzend zu dem, was wir besprochen haben: ',
        'Aufbauend auf deiner letzten Nachricht: '
      ],
      en: [
        'Based on our previous discussion: ',
        'To come back to your previous question: ',
        'In addition to what we discussed: ',
        'Building on your last message: '
      ]
    };

    const intros = contextIntros[language] || contextIntros.en;
    const intro = intros[Math.floor(Math.random() * intros.length)];
    return intro + response;
  }

  return response;
}

export async function generateDemoResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AIResponse> {
  // Load AI settings
  const aiSettings = loadAISettings();

  // Get current language from i18n
  const language = i18n.language.split('-')[0]; // 'en-US' -> 'en'

  // Simulate AI thinking time (2-4 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

  // Detect intent from user message
  const intent = detectIntent(userMessage);

  // Get template responses for current language (fallback to English)
  const template = responseTemplates[intent];
  const languageResponses = template.responses[language] || template.responses.en || template.responses.de;
  let response = getRandomResponse(languageResponses);

  // Add context awareness
  const previousUserMessages = conversationHistory
    .filter(m => m.role === 'user')
    .map(m => m.content);

  let contextualContent = addContextAwareness(response.content, previousUserMessages, language);

  // Apply AI settings to modify response
  const finalResponse = applyAISettings(contextualContent, aiSettings, response.rating);

  return finalResponse;
}

export function getRatingEmoji(rating: 'good' | 'medium' | 'bad'): string {
  switch (rating) {
    case 'good': return '✅';
    case 'medium': return '⚠️';
    case 'bad': return '❌';
  }
}

export function getRatingLabel(rating: 'good' | 'medium' | 'bad'): string {
  // Use i18n for rating labels
  const key = `rating.${rating}`;
  return i18n.t(key);
}