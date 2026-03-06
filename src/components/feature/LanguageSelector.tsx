import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../supabase/AuthContext';
import { updateUserDocument } from '../../supabase/database';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
];

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const { firebaseUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(
    SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]
  );

  // Keep currentLanguage in sync if language is changed from Settings page
  useEffect(() => {
    const found = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language);
    if (found) setCurrentLanguage(found);
  }, [i18n.language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (language: LanguageOption) => {
    i18n.changeLanguage(language.code);
    setCurrentLanguage(language);
    setIsOpen(false);
    // Persist to Supabase so next login restores the right language
    if (firebaseUser?.id) {
      try {
        await updateUserDocument(firebaseUser.id, { language: language.code });
      } catch { /* ignore */ }
    }
  };

  return (
    <div className="language-selector relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={t('settings.preferences.language')}
        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-[#2A2A2A]"
      >
        <i className="ri-global-line text-xl"></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-56 bg-[#242424] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="font-semibold text-white text-sm">{t('settings.preferences.chooseLanguage')}</h3>
          </div>
          <div className="p-2 max-h-[300px] overflow-y-auto style-scroll">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors cursor-pointer ${currentLanguage.code === language.code
                  ? 'bg-[#C9A961]/10 text-[#C9A961]'
                  : 'text-gray-300 hover:bg-[#2A2A2A]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{language.nativeName}</span>
                    <span className="text-xs text-gray-500">{language.name}</span>
                  </div>
                </div>
                {currentLanguage.code === language.code && (
                  <i className="ri-check-line text-[#C9A961]"></i>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
