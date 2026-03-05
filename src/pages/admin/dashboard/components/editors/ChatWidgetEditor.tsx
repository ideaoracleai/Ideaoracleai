
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'website_chat_widget';

const LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
];

interface LanguageTexts {
  mainLabel: string;
  startButtonText: string;
  endButtonText: string;
  emptyChatMessage: string;
  emptyVoiceMessage: string;
}

interface ChatWidgetConfig {
  texts: Record<string, LanguageTexts>;
  appearance: {
    theme: 'light' | 'dark';
    size: 'tiny' | 'compact' | 'full';
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    accentColor: string;
    buttonBaseColor: string;
    buttonAccentColor: string;
  };
}

const DEFAULT_TEXTS: Record<string, LanguageTexts> = {
  de: {
    mainLabel: 'Support & Hilfe',
    startButtonText: 'Gespräch starten',
    endButtonText: 'Gespräch beenden',
    emptyChatMessage: 'Hallo! Ich helfe dir bei Fragen zu Paketen, Funktionen und Kündigungen. Für persönlichen Support: support@ideaoracle.ai',
    emptyVoiceMessage: 'Hallo! Wie kann ich dir bei IdeaOracle helfen?',
  },
  en: {
    mainLabel: 'Support & Help',
    startButtonText: 'Start conversation',
    endButtonText: 'End conversation',
    emptyChatMessage: 'Hello! I help with questions about packages, features, and cancellations. For personal support: support@ideaoracle.ai',
    emptyVoiceMessage: 'Hello! How can I help you with IdeaOracle?',
  },
  fr: {
    mainLabel: 'Support & Aide',
    startButtonText: 'D\u00e9marrer la conversation',
    endButtonText: 'Terminer la conversation',
    emptyChatMessage: 'Bonjour ! Je vous aide pour les questions sur les forfaits, fonctionnalit\u00e9s et r\u00e9siliations. Support personnel : support@ideaoracle.ai',
    emptyVoiceMessage: 'Bonjour ! Comment puis-je vous aider avec IdeaOracle ?',
  },
  es: {
    mainLabel: 'Soporte y Ayuda',
    startButtonText: 'Iniciar conversaci\u00f3n',
    endButtonText: 'Finalizar conversaci\u00f3n',
    emptyChatMessage: '\u00a1Hola! Te ayudo con preguntas sobre paquetes, funciones y cancelaciones. Soporte personal: support@ideaoracle.ai',
    emptyVoiceMessage: '\u00a1Hola! \u00bfC\u00f3mo puedo ayudarte con IdeaOracle?',
  },
  it: {
    mainLabel: 'Supporto e Aiuto',
    startButtonText: 'Inizia conversazione',
    endButtonText: 'Termina conversazione',
    emptyChatMessage: 'Ciao! Ti aiuto con domande su pacchetti, funzionalit\u00e0 e cancellazioni. Supporto personale: support@ideaoracle.ai',
    emptyVoiceMessage: 'Ciao! Come posso aiutarti con IdeaOracle?',
  },
  pt: {
    mainLabel: 'Suporte e Ajuda',
    startButtonText: 'Iniciar conversa',
    endButtonText: 'Encerrar conversa',
    emptyChatMessage: 'Ol\u00e1! Ajudo com perguntas sobre pacotes, funcionalidades e cancelamentos. Suporte pessoal: support@ideaoracle.ai',
    emptyVoiceMessage: 'Ol\u00e1! Como posso ajud\u00e1-lo com o IdeaOracle?',
  },
  nl: {
    mainLabel: 'Ondersteuning & Hulp',
    startButtonText: 'Gesprek starten',
    endButtonText: 'Gesprek be\u00ebindigen',
    emptyChatMessage: 'Hallo! Ik help met vragen over pakketten, functies en opzeggingen. Persoonlijke ondersteuning: support@ideaoracle.ai',
    emptyVoiceMessage: 'Hallo! Hoe kan ik je helpen met IdeaOracle?',
  },
  pl: {
    mainLabel: 'Wsparcie i Pomoc',
    startButtonText: 'Rozpocznij rozmow\u0119',
    endButtonText: 'Zako\u0144cz rozmow\u0119',
    emptyChatMessage: 'Cze\u015b\u0107! Pomagam w pytaniach o pakiety, funkcje i anulowania. Wsparcie osobiste: support@ideaoracle.ai',
    emptyVoiceMessage: 'Cze\u015b\u0107! Jak mog\u0119 ci pom\u00f3c z IdeaOracle?',
  },
  ru: {
    mainLabel: '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0438 \u041f\u043e\u043c\u043e\u0449\u044c',
    startButtonText: '\u041d\u0430\u0447\u0430\u0442\u044c \u0440\u0430\u0437\u0433\u043e\u0432\u043e\u0440',
    endButtonText: '\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c \u0440\u0430\u0437\u0433\u043e\u0432\u043e\u0440',
    emptyChatMessage: '\u041f\u0440\u0438\u0432\u0435\u0442! \u041f\u043e\u043c\u043e\u0433\u0430\u044e \u0441 \u0432\u043e\u043f\u0440\u043e\u0441\u0430\u043c\u0438 \u043e \u043f\u0430\u043a\u0435\u0442\u0430\u0445, \u0444\u0443\u043d\u043a\u0446\u0438\u044f\u0445 \u0438 \u043e\u0442\u043c\u0435\u043d\u0435. \u041b\u0438\u0447\u043d\u0430\u044f \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430: support@ideaoracle.ai',
    emptyVoiceMessage: '\u041f\u0440\u0438\u0432\u0435\u0442! \u041a\u0430\u043a \u044f \u043c\u043e\u0433\u0443 \u043f\u043e\u043c\u043e\u0447\u044c \u0432\u0430\u043c \u0441 IdeaOracle?',
  },
  tr: {
    mainLabel: 'Destek ve Yard\u0131m',
    startButtonText: 'Sohbeti ba\u015flat',
    endButtonText: 'Sohbeti bitir',
    emptyChatMessage: 'Merhaba! Paketler, \u00f6zellikler ve iptal konular\u0131nda yard\u0131mc\u0131 oluyorum. Ki\u015fisel destek: support@ideaoracle.ai',
    emptyVoiceMessage: 'Merhaba! IdeaOracle ile nas\u0131l yard\u0131mc\u0131 olabilirim?',
  },
  ar: {
    mainLabel: '\u0627\u0644\u062f\u0639\u0645 \u0648\u0627\u0644\u0645\u0633\u0627\u0639\u062f\u0629',
    startButtonText: '\u0628\u062f\u0621 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629',
    endButtonText: '\u0625\u0646\u0647\u0627\u0621 \u0627\u0644\u0645\u062d\u0627\u062f\u062b\u0629',
    emptyChatMessage: '\u0645\u0631\u062d\u0628\u0627\u064b! \u0623\u0633\u0627\u0639\u062f \u0641\u064a \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u062d\u0648\u0644 \u0627\u0644\u0628\u0627\u0642\u0627\u062a \u0648\u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0648\u0627\u0644\u0625\u0644\u063a\u0627\u0621. \u0627\u0644\u062f\u0639\u0645 \u0627\u0644\u0634\u062e\u0635\u064a: support@ideaoracle.ai',
    emptyVoiceMessage: '\u0645\u0631\u062d\u0628\u0627\u064b! \u0643\u064a\u0641 \u064a\u0645\u0643\u0646\u0646\u064a \u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0645\u0639 IdeaOracle\u061f',
  },
  hi: {
    mainLabel: '\u0938\u0939\u093e\u092f\u0924\u093e \u0914\u0930 \u092e\u0926\u0926',
    startButtonText: '\u092c\u093e\u0924\u091a\u0940\u0924 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902',
    endButtonText: '\u092c\u093e\u0924\u091a\u0940\u0924 \u0938\u092e\u093e\u092a\u094d\u0924 \u0915\u0930\u0947\u0902',
    emptyChatMessage: '\u0928\u092e\u0938\u094d\u0924\u0947! \u092e\u0948\u0902 \u092a\u0948\u0915\u0947\u091c, \u0938\u0941\u0935\u093f\u0927\u093e\u0913\u0902 \u0914\u0930 \u0930\u0926\u094d\u0926\u0940\u0915\u0930\u0923 \u0915\u0947 \u092c\u093e\u0930\u0947 \u092e\u0947\u0902 \u092a\u094d\u0930\u0936\u094d\u0928\u094b\u0902 \u092e\u0947\u0902 \u092e\u0926\u0926 \u0915\u0930\u0924\u093e \u0939\u0942\u0902\u0964 \u0935\u094d\u092f\u0915\u094d\u0924\u093f\u0917\u0924 \u0938\u0939\u093e\u092f\u0924\u093e: support@ideaoracle.ai',
    emptyVoiceMessage: '\u0928\u092e\u0938\u094d\u0924\u0947! \u092e\u0948\u0902 IdeaOracle \u0915\u0947 \u0938\u093e\u0925 \u0906\u092a\u0915\u0940 \u0915\u0948\u0938\u0947 \u092e\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093e \u0939\u0942\u0902?',
  },
  ja: {
    mainLabel: '\u30b5\u30dd\u30fc\u30c8\uff06\u30d8\u30eb\u30d7',
    startButtonText: '\u4f1a\u8a71\u3092\u958b\u59cb',
    endButtonText: '\u4f1a\u8a71\u3092\u7d42\u4e86',
    emptyChatMessage: '\u3053\u3093\u306b\u3061\u306f\uff01\u30d1\u30c3\u30b1\u30fc\u30b8\u3001\u6a5f\u80fd\u3001\u30ad\u30e3\u30f3\u30bb\u30eb\u306b\u95a2\u3059\u308b\u8cea\u554f\u3092\u30b5\u30dd\u30fc\u30c8\u3057\u307e\u3059\u3002\u500b\u4eba\u30b5\u30dd\u30fc\u30c8\uff1asupport@ideaoracle.ai',
    emptyVoiceMessage: '\u3053\u3093\u306b\u3061\u306f\uff01IdeaOracle\u306b\u3064\u3044\u3066\u3069\u306e\u3088\u3046\u306b\u304a\u624b\u4f1d\u3044\u3067\u304d\u307e\u3059\u304b\uff1f',
  },
  ko: {
    mainLabel: '\uc9c0\uc6d0 \ubc0f \ub3c4\uc6c0\ub9d0',
    startButtonText: '\ub300\ud654 \uc2dc\uc791',
    endButtonText: '\ub300\ud654 \uc885\ub8cc',
    emptyChatMessage: '\uc548\ub155\ud558\uc138\uc694! \ud328\ud0a4\uc9c0, \uae30\ub2a5 \ubc0f \ucde8\uc18c\uc5d0 \ub300\ud55c \uc9c8\ubb38\uc744 \ub3c4\uc640\ub4dc\ub9bd\ub2c8\ub2e4. \uac1c\uc778 \uc9c0\uc6d0: support@ideaoracle.ai',
    emptyVoiceMessage: '\uc548\ub155\ud558\uc138\uc694! IdeaOracle\uc5d0 \ub300\ud574 \uc5b4\ub5bb\uac8c \ub3c4\uc640\ub4dc\ub9b4\uae4c\uc694?',
  },
  zh: {
    mainLabel: '\u652f\u6301\u4e0e\u5e2e\u52a9',
    startButtonText: '\u5f00\u59cb\u5bf9\u8bdd',
    endButtonText: '\u7ed3\u675f\u5bf9\u8bdd',
    emptyChatMessage: '\u4f60\u597d\uff01\u6211\u5e2e\u52a9\u89e3\u7b54\u6709\u5173\u5957\u9910\u3001\u529f\u80fd\u548c\u53d6\u6d88\u7684\u95ee\u9898\u3002\u4e2a\u4eba\u652f\u6301\uff1asupport@ideaoracle.ai',
    emptyVoiceMessage: '\u4f60\u597d\uff01\u5173\u4e8eIdeaOracle\uff0c\u6211\u80fd\u5e2e\u4f60\u4ec0\u4e48\uff1f',
  },
  th: {
    mainLabel: '\u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19\u0e41\u0e25\u0e30\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e2b\u0e25\u0e37\u0e2d',
    startButtonText: '\u0e40\u0e23\u0e34\u0e48\u0e21\u0e01\u0e32\u0e23\u0e2a\u0e19\u0e17\u0e19\u0e32',
    endButtonText: '\u0e2a\u0e34\u0e49\u0e19\u0e2a\u0e38\u0e14\u0e01\u0e32\u0e23\u0e2a\u0e19\u0e17\u0e19\u0e32',
    emptyChatMessage: '\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35! \u0e09\u0e31\u0e19\u0e0a\u0e48\u0e27\u0e22\u0e15\u0e2d\u0e1a\u0e04\u0e33\u0e16\u0e32\u0e21\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e41\u0e1e\u0e47\u0e04\u0e40\u0e01\u0e08 \u0e1f\u0e35\u0e40\u0e08\u0e2d\u0e23\u0e4c \u0e41\u0e25\u0e30\u0e01\u0e32\u0e23\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01 \u0e2a\u0e19\u0e31\u0e1a\u0e2a\u0e19\u0e38\u0e19\u0e2a\u0e48\u0e27\u0e19\u0e1a\u0e38\u0e04\u0e04\u0e25: support@ideaoracle.ai',
    emptyVoiceMessage: '\u0e2a\u0e27\u0e31\u0e2a\u0e14\u0e35! \u0e09\u0e31\u0e19\u0e08\u0e30\u0e0a\u0e48\u0e27\u0e22\u0e04\u0e38\u0e13\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a IdeaOracle \u0e44\u0e14\u0e49\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e44\u0e23?',
  },
  vi: {
    mainLabel: 'H\u1ed7 tr\u1ee3 & Tr\u1ee3 gi\u00fap',
    startButtonText: 'B\u1eaft \u0111\u1ea7u cu\u1ed9c tr\u00f2 chuy\u1ec7n',
    endButtonText: 'K\u1ebft th\u00fac cu\u1ed9c tr\u00f2 chuy\u1ec7n',
    emptyChatMessage: 'Xin ch\u00e0o! T\u00f4i gi\u00fap tr\u1ea3 l\u1eddi c\u00e2u h\u1ecfi v\u1ec1 g\u00f3i, t\u00ednh n\u0103ng v\u00e0 h\u1ee7y b\u1ecf. H\u1ed7 tr\u1ee3 c\u00e1 nh\u00e2n: support@ideaoracle.ai',
    emptyVoiceMessage: 'Xin ch\u00e0o! T\u00f4i c\u00f3 th\u1ec3 gi\u00fap g\u00ec cho b\u1ea1n v\u1edbi IdeaOracle?',
  },
  sv: {
    mainLabel: 'Support & Hj\u00e4lp',
    startButtonText: 'Starta konversation',
    endButtonText: 'Avsluta konversation',
    emptyChatMessage: 'Hej! Jag hj\u00e4lper till med fr\u00e5gor om paket, funktioner och upps\u00e4gningar. Personlig support: support@ideaoracle.ai',
    emptyVoiceMessage: 'Hej! Hur kan jag hj\u00e4lpa dig med IdeaOracle?',
  },
  no: {
    mainLabel: 'St\u00f8tte & Hjelp',
    startButtonText: 'Start samtale',
    endButtonText: 'Avslutt samtale',
    emptyChatMessage: 'Hei! Jeg hjelper med sp\u00f8rsm\u00e5l om pakker, funksjoner og oppsigelser. Personlig st\u00f8tte: support@ideaoracle.ai',
    emptyVoiceMessage: 'Hei! Hvordan kan jeg hjelpe deg med IdeaOracle?',
  },
  id: {
    mainLabel: 'Dukungan & Bantuan',
    startButtonText: 'Mulai percakapan',
    endButtonText: 'Akhiri percakapan',
    emptyChatMessage: 'Halo! Saya membantu pertanyaan tentang paket, fitur, dan pembatalan. Dukungan pribadi: support@ideaoracle.ai',
    emptyVoiceMessage: 'Halo! Bagaimana saya bisa membantu Anda dengan IdeaOracle?',
  },
  sq: {
    mainLabel: 'Mb\u00ebshtetje & Ndihm\u00eb',
    startButtonText: 'Fillo bised\u00ebn',
    endButtonText: 'Mbyll bised\u00ebn',
    emptyChatMessage: 'P\u00ebrsh\u00ebndetje! Ndihmoj me pyetje rreth paketave, funksioneve dhe anulimeve. Mb\u00ebshtetje personale: support@ideaoracle.ai',
    emptyVoiceMessage: 'P\u00ebrsh\u00ebndetje! Si mund t\'ju ndihmoj me IdeaOracle?',
  },
};

const DEFAULT_APPEARANCE = {
  theme: 'light' as const,
  size: 'compact' as const,
  position: 'bottom-right' as const,
  accentColor: '#B87333',
  buttonBaseColor: '#1a1a1a',
  buttonAccentColor: '#FFFFFF',
};

const FIELD_LABELS: Record<keyof LanguageTexts, { label: string; placeholder: string; help: string }> = {
  mainLabel: {
    label: 'Widget-Titel',
    placeholder: 'z.B. Support & Hilfe',
    help: 'Der Titel oben im Chat-Fenster',
  },
  startButtonText: {
    label: 'Start-Button Text',
    placeholder: 'z.B. Gespr\u00e4ch starten',
    help: 'Text auf dem Button zum Starten eines Sprachanrufs',
  },
  endButtonText: {
    label: 'Ende-Button Text',
    placeholder: 'z.B. Gespr\u00e4ch beenden',
    help: 'Text auf dem Button zum Beenden eines Sprachanrufs',
  },
  emptyChatMessage: {
    label: 'Begr\u00fc\u00dfung (Chat)',
    placeholder: 'z.B. Hallo! Wie kann ich dir helfen?',
    help: 'Nachricht, die angezeigt wird, wenn der Chat leer ist',
  },
  emptyVoiceMessage: {
    label: 'Begr\u00fc\u00dfung (Sprache)',
    placeholder: 'z.B. Hallo! Wie kann ich dir helfen?',
    help: 'Nachricht, die im Sprachmodus angezeigt wird',
  },
};

function detectCurrentLanguage(): string {
  const stored = localStorage.getItem('i18nextLng');
  if (stored) return stored.substring(0, 2);
  return 'de';
}

function reloadWidgetWithConfig(config: ChatWidgetConfig) {
  const lang = detectCurrentLanguage();
  const texts = config.texts[lang] || config.texts['de'] || DEFAULT_TEXTS['de'];
  const app = config.appearance;

  // Remove existing widget elements
  document.querySelectorAll('[class*="vapi"], [id*="vapi"]').forEach(el => el.remove());

  // Remove old script
  const oldScripts = document.querySelectorAll('script[src*="readdy.ai/api/public/assistant/widget"]');
  oldScripts.forEach(s => s.remove());

  // Create fresh script with updated attributes
  const newScript = document.createElement('script');
  newScript.src = 'https://readdy.ai/api/public/assistant/widget?projectId=97613a9c-39a9-4c44-bf80-417b5617e028';
  newScript.setAttribute('mode', 'hybrid');
  newScript.setAttribute('voice-show-transcript', 'true');
  newScript.setAttribute('theme', app.theme);
  newScript.setAttribute('size', app.size);
  newScript.setAttribute('position', app.position);
  newScript.setAttribute('accent-color', app.accentColor);
  newScript.setAttribute('button-base-color', app.buttonBaseColor);
  newScript.setAttribute('button-accent-color', app.buttonAccentColor);
  newScript.setAttribute('main-label', texts.mainLabel);
  newScript.setAttribute('start-button-text', texts.startButtonText);
  newScript.setAttribute('end-button-text', texts.endButtonText);
  newScript.setAttribute('empty-chat-message', texts.emptyChatMessage);
  newScript.setAttribute('empty-voice-message', texts.emptyVoiceMessage);
  newScript.defer = true;

  document.body.appendChild(newScript);
}

export default function ChatWidgetEditor() {
  const [config, setConfig] = useState<ChatWidgetConfig>({
    texts: { ...DEFAULT_TEXTS },
    appearance: { ...DEFAULT_APPEARANCE },
  });
  const [activeLang, setActiveLang] = useState('de');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [searchLang, setSearchLang] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState<'texts' | 'appearance'>('texts');

  // Load saved config on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const mergedTexts: Record<string, LanguageTexts> = {};
        LANGUAGES.forEach(lang => {
          mergedTexts[lang.code] = {
            ...DEFAULT_TEXTS[lang.code],
            ...(parsed.texts?.[lang.code] || {}),
          };
        });
        setConfig({
          texts: mergedTexts,
          appearance: { ...DEFAULT_APPEARANCE, ...(parsed.appearance || {}) },
        });
      }
    } catch (e) {
      console.error('Failed to load chat widget config:', e);
    }
  }, []);

  const updateText = useCallback((field: keyof LanguageTexts, value: string) => {
    setConfig(prev => ({
      ...prev,
      texts: {
        ...prev.texts,
        [activeLang]: {
          ...prev.texts[activeLang],
          [field]: value,
        },
      },
    }));
  }, [activeLang]);

  const updateAppearance = useCallback(<K extends keyof ChatWidgetConfig['appearance']>(
    key: K,
    value: ChatWidgetConfig['appearance'][K],
  ) => {
    setConfig(prev => ({
      ...prev,
      appearance: { ...prev.appearance, [key]: value },
    }));
  }, []);

  const handleSave = useCallback(() => {
    try {
      setSaveError('');
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      // Reload the widget with new config so changes take effect immediately
      reloadWidgetWithConfig(config);

      // Dispatch event for other components
      window.dispatchEvent(new Event('website_data_updated'));
      window.dispatchEvent(new CustomEvent('chat_widget_updated', { detail: config }));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Failed to save chat widget config:', e);
      setSaveError('Fehler beim Speichern. Bitte versuche es erneut.');
      setTimeout(() => setSaveError(''), 4000);
    }
  }, [config]);

  const handleReset = useCallback(() => {
    const confirmed = window.confirm('Alle Einstellungen auf Standard zurücksetzen?');
    if (!confirmed) return;
    const resetConfig: ChatWidgetConfig = {
      texts: { ...DEFAULT_TEXTS },
      appearance: { ...DEFAULT_APPEARANCE },
    };
    setConfig(resetConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resetConfig));
    reloadWidgetWithConfig(resetConfig);
    window.dispatchEvent(new Event('website_data_updated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, []);

  const copyFromLanguage = useCallback((sourceLang: string) => {
    if (sourceLang === activeLang) return;
    const sourceTexts = config.texts[sourceLang];
    if (sourceTexts) {
      setConfig(prev => ({
        ...prev,
        texts: {
          ...prev.texts,
          [activeLang]: { ...sourceTexts },
        },
      }));
    }
  }, [activeLang, config.texts]);

  const resetLanguageToDefault = useCallback(() => {
    const defaults = DEFAULT_TEXTS[activeLang];
    if (defaults) {
      setConfig(prev => ({
        ...prev,
        texts: {
          ...prev.texts,
          [activeLang]: { ...defaults },
        },
      }));
    }
  }, [activeLang]);

  const currentTexts = config.texts[activeLang] || DEFAULT_TEXTS[activeLang] || DEFAULT_TEXTS.de;

  const filteredLanguages = LANGUAGES.filter(
    lang =>
      lang.label.toLowerCase().includes(searchLang.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchLang.toLowerCase()),
  );

  const hasCustomText = (langCode: string) => {
    const texts = config.texts[langCode];
    const defaults = DEFAULT_TEXTS[langCode];
    if (!texts || !defaults) return false;
    return Object.keys(texts).some(
      key => texts[key as keyof LanguageTexts] !== defaults[key as keyof LanguageTexts],
    );
  };

  const customCount = LANGUAGES.filter(l => hasCustomText(l.code)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
            <i className="ri-chat-voice-line text-[#C9A961] text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Talk with Us</h3>
            <p className="text-slate-400 text-xs">
              Support-Assistent Texte in 21 Sprachen konfigurieren
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const btn = document.querySelector('#vapi-widget-floating-button') as HTMLElement;
            if (btn) btn.click();
          }}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <i className="ri-chat-3-line"></i> Widget testen
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 flex items-start gap-3">
        <i className="ri-information-line text-emerald-400 text-lg mt-0.5"></i>
        <p className="text-emerald-300 text-xs leading-relaxed">
          \u00c4nderungen werden nach dem Klick auf <strong>&quot;Einstellungen speichern&quot;</strong> sofort im KI-Assistenten \u00fcbernommen. Du kannst das Widget unten rechts direkt testen.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-fit">
        <button
          onClick={() => setActiveSection('texts')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'texts'
              ? 'bg-[#C9A961] text-[#0F1419]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-translate-2"></i> Texte & Sprachen
        </button>
        <button
          onClick={() => setActiveSection('appearance')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeSection === 'appearance'
              ? 'bg-[#C9A961] text-[#0F1419]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-palette-line"></i> Aussehen
        </button>
      </div>

      {activeSection === 'texts' && (
        <div className="flex gap-6">
          {/* Language Sidebar */}
          <div className="w-52 flex-shrink-0">
            <div className="mb-3">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
                <input
                  type="text"
                  value={searchLang}
                  onChange={e => setSearchLang(e.target.value)}
                  placeholder="Sprache suchen..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#C9A961]/50"
                />
              </div>
            </div>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {filteredLanguages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeLang === lang.code
                      ? 'bg-[#C9A961]/20 text-[#C9A961]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="truncate flex-1 text-left">{lang.label}</span>
                  {hasCustomText(lang.code) && (
                    <span className="w-2 h-2 bg-[#C9A961] rounded-full flex-shrink-0"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Text Fields */}
          <div className="flex-1 space-y-5">
            {/* Active Language Header */}
            <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {LANGUAGES.find(l => l.code === activeLang)?.flag}
                </span>
                <span className="text-sm font-semibold text-white">
                  {LANGUAGES.find(l => l.code === activeLang)?.label}
                </span>
                <span className="text-xs text-slate-500 uppercase">({activeLang})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetLanguageToDefault}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                  title="Diese Sprache auf Standard zur\u00fccksetzen"
                >
                  <i className="ri-refresh-line"></i> Standard
                </button>
                <span className="text-slate-600">|</span>
                <span className="text-xs text-slate-500">Kopieren von:</span>
                <select
                  onChange={e => {
                    copyFromLanguage(e.target.value);
                    e.target.value = '';
                  }}
                  value=""
                  className="bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C9A961]/50 cursor-pointer"
                >
                  <option value="" disabled>
                    Sprache w\u00e4hlen...
                  </option>
                  {LANGUAGES.filter(l => l.code !== activeLang).map(l => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fields */}
            {(Object.keys(FIELD_LABELS) as (keyof LanguageTexts)[]).map(field => (
              <div key={field}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    {FIELD_LABELS[field].label}
                  </label>
                  <span className="text-xs text-slate-500">{FIELD_LABELS[field].help}</span>
                </div>
                {field === 'emptyChatMessage' || field === 'emptyVoiceMessage' ? (
                  <div className="relative">
                    <textarea
                      value={currentTexts[field]}
                      onChange={e => {
                        if (e.target.value.length <= 500) {
                          updateText(field, e.target.value);
                        }
                      }}
                      placeholder={FIELD_LABELS[field].placeholder}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A961]/50 transition-colors text-sm resize-none"
                    />
                    <span className="absolute bottom-2 right-3 text-xs text-slate-600">
                      {currentTexts[field].length}/500
                    </span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={currentTexts[field]}
                    onChange={e => updateText(field, e.target.value)}
                    placeholder={FIELD_LABELS[field].placeholder}
                    className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A961]/50 transition-colors text-sm"
                  />
                )}
              </div>
            ))}

            {/* Language Coverage Info */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className="ri-global-line text-[#C9A961]"></i>
                  <span className="text-sm font-semibold text-white">Sprachabdeckung</span>
                </div>
                <span className="text-xs text-slate-400">
                  {customCount > 0 ? `${customCount} angepasst` : 'Alle Standard'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setActiveLang(lang.code)}
                    className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
                      activeLang === lang.code
                        ? 'bg-[#C9A961] text-[#0F1419] ring-1 ring-[#C9A961]'
                        : hasCustomText(lang.code)
                        ? 'bg-[#C9A961]/20 text-[#C9A961] hover:bg-[#C9A961]/30'
                        : 'bg-slate-700/60 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {lang.flag} {lang.code.toUpperCase()}
                    {hasCustomText(lang.code) && activeLang !== lang.code && (
                      <i className="ri-check-line text-[10px]"></i>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                <i className="ri-information-line mr-1"></i>
                Alle Sprachen haben Standard-Texte. Angepasste Sprachen sind gold markiert. Klicke auf eine Sprache zum Bearbeiten.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'appearance' && (
        <div className="space-y-5">
          {/* Theme */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Theme</label>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map(theme => (
                <button
                  key={theme}
                  onClick={() => updateAppearance('theme', theme)}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                    config.appearance.theme === theme
                      ? 'bg-[#C9A961] text-[#0F1419]'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <i className={theme === 'light' ? 'ri-sun-line' : 'ri-moon-line'}></i>
                  {theme === 'light' ? 'Hell' : 'Dunkel'}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Gr\u00f6\u00dfe</label>
            <div className="flex gap-2">
              {(['tiny', 'compact', 'full'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => updateAppearance('size', size)}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    config.appearance.size === size
                      ? 'bg-[#C9A961] text-[#0F1419]'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {size === 'tiny' ? 'Klein' : size === 'compact' ? 'Kompakt' : 'Voll'}
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Position</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'bottom-right', label: 'Unten rechts', icon: 'ri-corner-down-right-line' },
                { value: 'bottom-left', label: 'Unten links', icon: 'ri-corner-down-left-line' },
                { value: 'top-right', label: 'Oben rechts', icon: 'ri-corner-up-right-line' },
                { value: 'top-left', label: 'Oben links', icon: 'ri-corner-up-left-line' },
              ] as const).map(pos => (
                <button
                  key={pos.value}
                  onClick={() => updateAppearance('position', pos.value)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    config.appearance.position === pos.value
                      ? 'bg-[#C9A961] text-[#0F1419]'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <i className={pos.icon}></i>
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Akzentfarbe</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.appearance.accentColor}
                  onChange={e => updateAppearance('accentColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.appearance.accentColor}
                  onChange={e => updateAppearance('accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961]/50"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Button-Farbe</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.appearance.buttonBaseColor}
                  onChange={e => updateAppearance('buttonBaseColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.appearance.buttonBaseColor}
                  onChange={e => updateAppearance('buttonBaseColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961]/50"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Button-Icon</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.appearance.buttonAccentColor}
                  onChange={e => updateAppearance('buttonAccentColor', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.appearance.buttonAccentColor}
                  onChange={e => updateAppearance('buttonAccentColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961]/50"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <span className="text-xs text-slate-500 mb-3 block">Vorschau</span>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: config.appearance.buttonBaseColor }}
              >
                <i
                  className="ri-chat-3-line text-2xl"
                  style={{ color: config.appearance.buttonAccentColor }}
                ></i>
              </div>
              <div className="flex-1">
                <div
                  className="h-8 rounded-lg flex items-center px-3"
                  style={{ backgroundColor: config.appearance.accentColor }}
                >
                  <span className="text-white text-xs font-medium">{currentTexts.mainLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Toggle */}
      <div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm text-[#C9A961] hover:text-[#A08748] transition-colors cursor-pointer"
        >
          <i className={showPreview ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
          {showPreview ? 'Vorschau ausblenden' : 'Aktuelle Konfiguration anzeigen'}
        </button>
        {showPreview && (
          <div className="mt-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">
              Aktive Konfiguration ({activeLang.toUpperCase()})
            </h4>
            <div className="space-y-2 text-xs">
              {(Object.keys(FIELD_LABELS) as (keyof LanguageTexts)[]).map(field => (
                <div key={field} className="flex items-start gap-2">
                  <span className="text-slate-500 w-32 flex-shrink-0">
                    {FIELD_LABELS[field].label}:
                  </span>
                  <span className="text-slate-300">{currentTexts[field]}</span>
                </div>
              ))}
              <div className="border-t border-slate-700 pt-2 mt-2">
                <span className="text-slate-500">Theme:</span>
                <span className="text-slate-300 ml-2">{config.appearance.theme}</span>
                <span className="text-slate-500 ml-4">Gr\u00f6\u00dfe:</span>
                <span className="text-slate-300 ml-2">{config.appearance.size}</span>
                <span className="text-slate-500 ml-4">Position:</span>
                <span className="text-slate-300 ml-2">{config.appearance.position}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <button
          onClick={handleReset}
          className="px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer whitespace-nowrap text-sm flex items-center gap-2"
        >
          <i className="ri-refresh-line"></i> Alles zur\u00fccksetzen
        </button>
        <div className="flex items-center gap-3">
          {saveError && (
            <span className="text-red-400 text-sm flex items-center gap-1">
              <i className="ri-error-warning-line"></i> {saveError}
            </span>
          )}
          {saved && (
            <span className="text-emerald-400 text-sm flex items-center gap-1">
              <i className="ri-check-double-line"></i> Gespeichert & \u00fcbernommen!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap text-sm flex items-center gap-2"
          >
            <i className="ri-save-line"></i> Einstellungen speichern
          </button>
        </div>
      </div>
    </div>
  );
}
