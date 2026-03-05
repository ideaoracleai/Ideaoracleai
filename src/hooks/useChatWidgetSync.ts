
import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'website_chat_widget';

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
    theme: string;
    size: string;
    position: string;
    accentColor: string;
    buttonBaseColor: string;
    buttonAccentColor: string;
  };
}

function getWidgetScript(): HTMLScriptElement | null {
  const scripts = document.querySelectorAll('script[src*="readdy.ai/api/public/assistant/widget"]');
  return scripts.length > 0 ? (scripts[0] as HTMLScriptElement) : null;
}

function detectUserLanguage(): string {
  const stored = localStorage.getItem('i18nextLng');
  if (stored) return stored.substring(0, 2);
  const nav = navigator.language || 'de';
  return nav.substring(0, 2);
}

function applyWidgetConfig(config: ChatWidgetConfig, lang?: string) {
  const script = getWidgetScript();
  if (!script) return;

  const activeLang = lang || detectUserLanguage();
  const texts = config.texts[activeLang] || config.texts['de'] || config.texts['en'];
  if (!texts) return;

  const app = config.appearance;

  script.setAttribute('theme', app.theme || 'light');
  script.setAttribute('size', app.size || 'compact');
  script.setAttribute('position', app.position || 'bottom-right');
  script.setAttribute('accent-color', app.accentColor || '#B87333');
  script.setAttribute('button-base-color', app.buttonBaseColor || '#1a1a1a');
  script.setAttribute('button-accent-color', app.buttonAccentColor || '#FFFFFF');
  script.setAttribute('main-label', texts.mainLabel || '');
  script.setAttribute('start-button-text', texts.startButtonText || '');
  script.setAttribute('end-button-text', texts.endButtonText || '');
  script.setAttribute('empty-chat-message', texts.emptyChatMessage || '');
  script.setAttribute('empty-voice-message', texts.emptyVoiceMessage || '');

  // Trigger widget reload by re-inserting the script
  const parent = script.parentNode;
  if (parent) {
    const newScript = document.createElement('script');
    newScript.src = script.src;
    // Copy all attributes
    Array.from(script.attributes).forEach(attr => {
      if (attr.name !== 'src') {
        newScript.setAttribute(attr.name, attr.value);
      }
    });
    
    // Remove old widget elements
    const oldButton = document.getElementById('vapi-widget-floating-button');
    if (oldButton) {
      const widgetContainer = oldButton.closest('[id*="vapi"]') || oldButton.parentElement;
      if (widgetContainer && widgetContainer !== document.body) {
        widgetContainer.remove();
      } else {
        oldButton.remove();
      }
    }
    // Remove all vapi-related elements
    document.querySelectorAll('[class*="vapi"], [id*="vapi"]').forEach(el => {
      if (el !== newScript) el.remove();
    });

    parent.removeChild(script);
    parent.appendChild(newScript);
  }
}

export function getStoredConfig(): ChatWidgetConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    // ignore
  }
  return null;
}

export function applySavedWidgetSettings(lang?: string) {
  const config = getStoredConfig();
  if (config) {
    applyWidgetConfig(config, lang);
  }
}

export default function useChatWidgetSync() {
  const syncWidget = useCallback((lang?: string) => {
    applySavedWidgetSettings(lang);
  }, []);

  useEffect(() => {
    // Listen for save events from ChatWidgetEditor
    const handleUpdate = () => {
      setTimeout(() => syncWidget(), 100);
    };
    window.addEventListener('chat_widget_updated', handleUpdate);
    
    // Listen for language changes
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.lang;
      if (newLang) {
        setTimeout(() => syncWidget(newLang), 100);
      }
    };
    window.addEventListener('language_changed', handleLangChange);

    // Apply on mount with small delay to ensure widget script is loaded
    const timer = setTimeout(() => syncWidget(), 1500);

    return () => {
      window.removeEventListener('chat_widget_updated', handleUpdate);
      window.removeEventListener('language_changed', handleLangChange);
      clearTimeout(timer);
    };
  }, [syncWidget]);

  return { syncWidget };
}
