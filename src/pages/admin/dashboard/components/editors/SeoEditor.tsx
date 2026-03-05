
import { useState, useEffect } from 'react';
import { defaultSeoData } from '../../../../../mocks/websiteDefaults';

interface Props {
  onSave: () => void;
}

export default function SeoEditor({ onSave }: Props) {
  const [data, setData] = useState(defaultSeoData);

  useEffect(() => {
    const saved = localStorage.getItem('website_seo');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        // fallback to defaults if parsing fails
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('website_seo', JSON.stringify(data));
      onSave();
    } catch (e) {
      console.error('Failed to save SEO data:', e);
    }
  };

  const handleReset = () => {
    setData(defaultSeoData);
    try {
      localStorage.removeItem('website_seo');
    } catch (e) {
      console.error('Failed to remove SEO data:', e);
    }
    onSave();
  };

  const update = (key: string, value: string) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">SEO-Einstellungen</h3>
          <p className="text-slate-400 text-sm mt-1">
            Suchmaschinenoptimierung für die Startseite
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

      {/* Google Vorschau */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-3">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-google-line text-[#C9A961]"></i> Google-Vorschau
        </h4>
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-green-700 mb-1 truncate">
            {data.ogUrl || 'https://ideaoracle.ai/'}
          </p>
          <p className="text-lg text-[#1a0dab] font-medium mb-1 truncate hover:underline cursor-pointer">
            {data.title || 'Seitentitel'}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {data.description || 'Beschreibung...'}
          </p>
        </div>
      </div>

      {/* Basis-SEO */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-search-line text-[#C9A961]"></i> Basis-SEO
        </h4>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-400 text-xs">Seitentitel</label>
            <span
              className={`text-xs ${
                data.title.length > 60 ? 'text-red-400' : 'text-slate-500'
              }`}
            >
              {data.title.length}/60
            </span>
          </div>
          <input
            type="text"
            value={data.title}
            onChange={e => update('title', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-400 text-xs">Meta-Beschreibung</label>
            <span
              className={`text-xs ${
                data.description.length > 160
                  ? 'text-red-400'
                  : data.description.length < 120
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {data.description.length}/160
            </span>
          </div>
          <textarea
            value={data.description}
            onChange={e => update('description', e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">
            Keywords (kommagetrennt)
          </label>
          <input
            type="text"
            value={data.keywords}
            onChange={e => update('keywords', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.keywords
              .split(',')
              .filter(k => k.trim())
              .map((keyword, i) => (
                <span
                  key={i}
                  className="bg-[#C9A961]/10 text-[#C9A961] px-2.5 py-1 rounded-full text-xs"
                >
                  {keyword.trim()}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Open Graph */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-share-line text-[#C9A961]"></i> Social Media (Open
          Graph)
        </h4>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">OG Titel</label>
          <input
            type="text"
            value={data.ogTitle}
            onChange={e => update('ogTitle', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">
            OG Beschreibung
          </label>
          <textarea
            value={data.ogDescription}
            onChange={e => update('ogDescription', e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">
            Canonical URL
          </label>
          <input
            type="text"
            value={data.ogUrl}
            onChange={e => update('ogUrl', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>
      </div>

      {/* Twitter */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-twitter-x-line text-[#C9A961]"></i> Twitter Card
        </h4>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">
            Twitter Titel
          </label>
          <input
            type="text"
            value={data.twitterTitle}
            onChange={e => update('twitterTitle', e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">
            Twitter Beschreibung
          </label>
          <textarea
            value={data.twitterDescription}
            onChange={e => update('twitterDescription', e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
          />
        </div>
      </div>

      {/* Hinweis */}
      <div className="bg-slate-800/30 rounded-xl border border-dashed border-slate-600 p-4 flex items-center gap-3">
        <i className="ri-information-line text-[#C9A961] text-xl"></i>
        <p className="text-slate-400 text-sm">
          SEO‑Änderungen werden nach dem Speichern beim nächsten Laden der
          Startseite angewendet.
        </p>
      </div>
    </div>
  );
}
