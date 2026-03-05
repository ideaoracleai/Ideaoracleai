
import { useState, useEffect } from 'react';
import { defaultCtaData } from '../../../../../mocks/websiteDefaults';

interface CtaData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
}

export default function CtaEditor() {
  const [data, setData] = useState<CtaData>(defaultCtaData);

  useEffect(() => {
    const saved = localStorage.getItem('website_cta');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse CTA data:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('website_cta', JSON.stringify(data));
    window.dispatchEvent(new Event('website_data_updated'));
    alert('CTA gespeichert!');
  };

  const handleReset = () => {
    setData(defaultCtaData);
    localStorage.removeItem('website_cta');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Call-to-Action bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">Handlungsaufforderung am Ende der Seite</p>
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

      {/* Inhalt */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-megaphone-line text-[#C9A961]"></i> CTA-Inhalt
        </h4>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Überschrift</label>
          <input
            type="text"
            value={data.title}
            onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Untertitel</label>
          <textarea
            value={data.subtitle}
            onChange={e => setData(prev => ({ ...prev, subtitle: e.target.value }))}
            rows={2}
            maxLength={500}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Button-Text</label>
            <input
              type="text"
              value={data.buttonText}
              onChange={e => setData(prev => ({ ...prev, buttonText: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Button-URL</label>
            <input
              type="text"
              value={data.buttonUrl}
              onChange={e => setData(prev => ({ ...prev, buttonUrl: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
      </div>

      {/* Vorschau */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
          <i className="ri-eye-line text-[#C9A961]"></i> Vorschau
        </h4>
        <div className="bg-white rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{data.title}</h2>
          <p className="text-gray-600 mb-6">{data.subtitle}</p>
          <button className="bg-[#5D4E37] text-white px-8 py-3 rounded-full font-medium inline-flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <span>{data.buttonText}</span>
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
