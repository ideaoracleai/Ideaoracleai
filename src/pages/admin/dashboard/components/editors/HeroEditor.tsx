
import { useState, useEffect } from 'react';
import { defaultHeroData } from '../../../../../mocks/websiteDefaults';

interface Props {
  onSave: () => void;
}

/**
 * HeroEditor – a simple editor for the hero section of the start page.
 * Includes robust handling for corrupted local‑storage data and graceful fallbacks.
 */
export default function HeroEditor({ onSave }: Props) {
  const [data, setData] = useState(defaultHeroData);

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

  const handleSave = () => {
    try {
      localStorage.setItem('website_hero', JSON.stringify(data));
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('website_data_updated'));
      alert('Hero-Daten gespeichert!');
    } catch (e) {
      console.error('Could not save hero data to localStorage', e);
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
          <h3 className="text-xl font-bold text-white">Hero‑Bereich bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">
            Texte, Buttons und Statistiken der Startseite
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-refresh-line"></i> Zurücksetzen
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-save-line"></i> Speichern
          </button>
        </div>
      </div>

      {/* Badge */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-price-tag-3-line text-[#C9A961]"></i> Badge‑Text
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
          <i className="ri-heading text-[#C9A961]"></i> Überschriften
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              Zeile 1 (weiß)
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
              Zeile 2 (gold)
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
          <i className="ri-text text-[#C9A961]"></i> Untertitel
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Zeile 1</label>
            <input
              type="text"
              value={data.subtitle}
              onChange={e => update('subtitle', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Zeile 2</label>
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
          <i className="ri-cursor-line text-[#C9A961]"></i> Buttons
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              Primär‑Button (gold)
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
              Sekundär‑Button (Rahmen)
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
          <i className="ri-bar-chart-line text-[#C9A961]"></i> Statistiken
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <label className="text-slate-400 text-xs block">
                Statistik {i}
              </label>
              <input
                type="text"
                value={(data as Record<string, string>)[`stat${i}Value`]}
                onChange={e => update(`stat${i}Value`, e.target.value)}
                placeholder="Wert"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
              />
              <input
                type="text"
                value={(data as Record<string, string>)[`stat${i}Label`]}
                onChange={e => update(`stat${i}Label`, e.target.value)}
                placeholder="Beschriftung"
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
          Änderungen werden nach dem Speichern auf der Startseite sichtbar.
          Lade die Seite neu, um die Vorschau zu sehen.
        </p>
      </div>
    </div>
  );
}
