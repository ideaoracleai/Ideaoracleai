
import { useState, useEffect } from 'react';
import { defaultAboutData } from '../../../../../mocks/websiteDefaults';

interface AboutData {
  badge: string;
  title: string;
  description: string;
  testimonial: {
    quote: string;
    name: string;
    role: string;
    avatar: string;
  };
}

export default function AboutEditor() {
  const [data, setData] = useState<AboutData>(defaultAboutData);

  useEffect(() => {
    const saved = localStorage.getItem('website_about');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse about data:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('website_about', JSON.stringify(data));
    window.dispatchEvent(new Event('website_data_updated'));
    alert('Über uns gespeichert!');
  };

  const handleReset = () => {
    setData(defaultAboutData);
    localStorage.removeItem('website_about');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Über uns bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">Unternehmensgeschichte und Zitat anpassen</p>
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

      {/* Hauptinhalt */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-article-line text-[#C9A961]"></i> Hauptinhalt
        </h4>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Badge</label>
          <input
            type="text"
            value={data.badge}
            onChange={e => setData(prev => ({ ...prev, badge: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Titel</label>
          <input
            type="text"
            value={data.title}
            onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Beschreibung</label>
          <textarea
            value={data.description}
            onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            maxLength={500}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
          />
          <p className="text-slate-500 text-xs mt-1 text-right">{data.description.length}/500</p>
        </div>
      </div>

      {/* Zitat */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-double-quotes-l text-[#C9A961]"></i> Hervorgehobenes Zitat
        </h4>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Zitat-Text</label>
          <textarea
            value={data.testimonial.quote}
            onChange={e => setData(prev => ({ 
              ...prev, 
              testimonial: { ...prev.testimonial, quote: e.target.value }
            }))}
            rows={3}
            maxLength={500}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Name</label>
            <input
              type="text"
              value={data.testimonial.name}
              onChange={e => setData(prev => ({ 
                ...prev, 
                testimonial: { ...prev.testimonial, name: e.target.value }
              }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Position</label>
            <input
              type="text"
              value={data.testimonial.role}
              onChange={e => setData(prev => ({ 
                ...prev, 
                testimonial: { ...prev.testimonial, role: e.target.value }
              }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Avatar-URL</label>
          <input
            type="text"
            value={data.testimonial.avatar}
            onChange={e => setData(prev => ({ 
              ...prev, 
              testimonial: { ...prev.testimonial, avatar: e.target.value }
            }))}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>

        {/* Vorschau */}
        <div className="bg-[#2A2520] rounded-xl p-6 mt-4">
          <p className="text-slate-400 text-xs mb-3">Vorschau:</p>
          <blockquote className="text-white text-lg font-medium leading-relaxed mb-4">
            "{data.testimonial.quote}"
          </blockquote>
          <div className="flex items-center gap-3">
            <img 
              src={data.testimonial.avatar} 
              alt={data.testimonial.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-white font-bold text-sm">{data.testimonial.name}</p>
              <p className="text-white/70 text-xs">{data.testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
