
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { defaultHeroData } from '../../../../../mocks/websiteDefaults';
import { saveEditorData } from '../../../../../utils/saveEditorData';

interface Props {
  onSave: () => void;
}

/**
 * HeroEditor – a simple editor for the hero section of the start page.
 * Includes robust handling for corrupted local‑storage data and graceful fallbacks.
 */
export default function HeroEditor({ onSave }: Props) {
  const [data, setData] = useState(defaultHeroData);
  const { t } = useTranslation();

  // Load saved data from localStorage – protect against malformed JSON.
  useEffect(() => {
    const saved = localStorage.getItem('website_hero');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure the parsed object has the expected shape before applying it.
        if (parsed && typeof parsed === 'object') {
          setData(parsed as typeof defaultHeroData);
        }
      } catch (e) {
        console.warn('Failed to parse stored hero data, using defaults.', e);
      }
    }
  }, []);

  const handleSave = async () => {
    try {
      await saveEditorData('website_hero', data);
      alert(t('admin.hero.savedMsg', 'Hero data saved!'));
    } catch (e) {
      console.error('Could not save hero data', e);
    }
    onSave();
  };

  const handleReset = () => {
    setData(defaultHeroData);
    localStorage.removeItem('website_hero');
    onSave();
  };

  const update = (key: string, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{t('admin.hero.title', 'Edit Hero Section')}</h3>
          <p className="text-slate-400 text-sm mt-1">
            {t('admin.hero.subtitle', 'Texts, buttons and statistics of the homepage')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-refresh-line"></i> {t('admin.hero.reset', 'Reset')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-save-line"></i> {t('admin.hero.save', 'Save')}
          </button>
        </div>
      </div>

      {/* Badge */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-price-tag-3-line text-[#C9A961]"></i> {t('admin.hero.badge', 'Badge Text')}
        </h4>
        <input
          type="text"
          value={data.badge}
          onChange={e => update('badge', e.target.value)}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
        />
      </div>

      {/* Titel */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-heading text-[#C9A961]"></i> {t('admin.hero.headings', 'Headings')}
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              {t('admin.hero.line1White', 'Line 1 (white)')}
            </label>
            <input
              type="text"
              value={data.title1}
              onChange={e => update('title1', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              {t('admin.hero.line2Gold', 'Line 2 (gold)')}
            </label>
            <input
              type="text"
              value={data.title2}
              onChange={e => update('title2', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Untertitel */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-text text-[#C9A961]"></i> {t('admin.hero.subtitleSection', 'Subtitle')}
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">{t('admin.hero.line1', 'Line 1')}</label>
            <input
              type="text"
              value={data.subtitle}
              onChange={e => update('subtitle', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">{t('admin.hero.line2', 'Line 2')}</label>
            <input
              type="text"
              value={data.subtitleLine2}
              onChange={e => update('subtitleLine2', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-cursor-line text-[#C9A961]"></i> {t('admin.hero.buttons', 'Buttons')}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              {t('admin.hero.primaryBtn', 'Primary Button (gold)')}
            </label>
            <input
              type="text"
              value={data.ctaPrimary}
              onChange={e => update('ctaPrimary', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              {t('admin.hero.secondaryBtn', 'Secondary Button (border)')}
            </label>
            <input
              type="text"
              value={data.ctaSecondary}
              onChange={e => update('ctaSecondary', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Statistiken */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-bar-chart-line text-[#C9A961]"></i> {t('admin.hero.stats', 'Statistics')}
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <label className="text-slate-400 text-xs block">
                {t('admin.hero.statN', 'Statistic {{n}}', { n: i })}
              </label>
              <input
                type="text"
                value={(data as Record<string, string>)[`stat${i}Value`]}
                onChange={e => update(`stat${i}Value`, e.target.value)}
                placeholder={t('admin.hero.value', 'Value')}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
              />
              <input
                type="text"
                value={(data as Record<string, string>)[`stat${i}Label`]}
                onChange={e => update(`stat${i}Label`, e.target.value)}
                placeholder={t('admin.hero.label', 'Label')}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Vorschau‑Hinweis */}
      <div className="bg-slate-800/30 rounded-xl border border-dashed border-slate-600 p-4 flex items-center gap-3">
        <i className="ri-information-line text-[#C9A961] text-xl"></i>
        <p className="text-slate-400 text-sm">
          {t('admin.hero.previewNote', 'Changes will be visible on the homepage after saving. Reload the page to see the preview.')}
        </p>
      </div>
    </div>
  );
}
