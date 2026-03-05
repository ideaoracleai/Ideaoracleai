import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

// Hard Guard: Fallback function to prevent i18n keys from being displayed
const missingKeyHandler = (lng: string[], ns: string, key: string) => {
  // Ensure key is a string
  if (typeof key !== 'string') {
    return '';
  }
  
  // If key looks like an i18n key (contains dots), return a readable fallback
  if (key.includes('.')) {
    const parts = key.split('.');
    const lastPart = parts[parts.length - 1];
    // Convert camelCase to readable text
    return lastPart.replace(/([A-Z])/g, ' $1').trim();
  }
  return key;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    debug: false,
    resources: messages,
    interpolation: {
      escapeValue: false,
    },
    // Hard Guard: Ensure missing translations show readable text, not keys
    saveMissing: false,
    missingKeyHandler,
    parseMissingKeyHandler: missingKeyHandler,
  });

// Save language preference to localStorage on change
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
