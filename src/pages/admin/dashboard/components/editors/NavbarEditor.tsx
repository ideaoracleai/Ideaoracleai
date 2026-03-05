
import { useState, useEffect } from 'react';
import { defaultNavbarData } from '../../../../../mocks/websiteDefaults';

interface NavLink {
  label: string;
  target: string;
}

interface NavbarData {
  logoText: string;
  logoAccent: string;
  slogan: string;
  logoIcon: string;
  links: NavLink[];
  ctaText: string;
  ctaUrl: string;
}

export default function NavbarEditor() {
  const [data, setData] = useState<NavbarData>(defaultNavbarData);
  const [editingLink, setEditingLink] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('website_navbar');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse navbar data:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('website_navbar', JSON.stringify(data));
    window.dispatchEvent(new Event('website_data_updated'));
    alert('Navigation gespeichert!');
  };

  const handleReset = () => {
    setData(defaultNavbarData);
    localStorage.removeItem('website_navbar');
  };

  const updateLink = (index: number, field: keyof NavLink, value: string) => {
    setData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const addLink = () => {
    setData(prev => ({
      ...prev,
      links: [...prev.links, { label: 'Neuer Link', target: 'section' }]
    }));
    setEditingLink(data.links.length);
  };

  const removeLink = (index: number) => {
    setData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
    if (editingLink === index) setEditingLink(null);
  };

  const moveLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= data.links.length) return;
    const newLinks = [...data.links];
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
    setData(prev => ({ ...prev, links: newLinks }));
  };

  const iconOptions = [
    'ri-compass-3-line', 'ri-lightbulb-line', 'ri-rocket-line', 'ri-star-line',
    'ri-brain-line', 'ri-magic-line', 'ri-flashlight-line', 'ri-sparkling-line',
    'ri-fire-line', 'ri-trophy-line', 'ri-medal-line', 'ri-vip-crown-line'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Navigation bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">Logo, Links und CTA-Button anpassen</p>
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

      {/* Logo Vorschau */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
          <i className="ri-image-line text-[#C9A961]"></i> Logo-Vorschau
        </h4>
        <div className="bg-[#0F1419] rounded-lg p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-xl flex items-center justify-center">
            <i className={`${data.logoIcon} text-[#0F1419] text-2xl`}></i>
          </div>
          <div>
            <span className="text-xl font-bold text-white">{data.logoText}<span className="text-amber-400">{data.logoAccent}</span></span>
            <p className="text-[10px] text-gray-400 -mt-0.5">{data.slogan}</p>
          </div>
        </div>
      </div>

      {/* Logo Einstellungen */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-edit-line text-[#C9A961]"></i> Logo-Einstellungen
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Logo-Text</label>
            <input
              type="text"
              value={data.logoText}
              onChange={e => setData(prev => ({ ...prev, logoText: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Akzent-Text (farbig)</label>
            <input
              type="text"
              value={data.logoAccent}
              onChange={e => setData(prev => ({ ...prev, logoAccent: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Slogan</label>
          <input
            type="text"
            value={data.slogan}
            onChange={e => setData(prev => ({ ...prev, slogan: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-2 block">Logo-Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {iconOptions.map(icon => (
              <button
                key={icon}
                onClick={() => setData(prev => ({ ...prev, logoIcon: icon }))}
                className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  data.logoIcon === icon
                    ? 'bg-[#C9A961] text-[#0F1419]'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                }`}
              >
                <i className={`${icon} text-xl`}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <i className="ri-links-line text-[#C9A961]"></i> Navigation-Links ({data.links.length})
          </h4>
          <button
            onClick={addLink}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <i className="ri-add-line"></i> Link hinzufügen
          </button>
        </div>
        
        <div className="space-y-2">
          {data.links.map((link, index) => (
            <div key={index} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs font-mono w-6 text-center">{index + 1}</span>
                  <span className="text-white text-sm font-medium">{link.label}</span>
                  <span className="text-slate-500 text-xs">→ #{link.target}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveLink(index, 'up')}
                    disabled={index === 0}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-all cursor-pointer disabled:opacity-30"
                  >
                    <i className="ri-arrow-up-s-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => moveLink(index, 'down')}
                    disabled={index === data.links.length - 1}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-all cursor-pointer disabled:opacity-30"
                  >
                    <i className="ri-arrow-down-s-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => setEditingLink(editingLink === index ? null : index)}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#C9A961] hover:bg-[#C9A961]/10 rounded-md transition-all cursor-pointer"
                  >
                    <i className={`${editingLink === index ? 'ri-arrow-up-s-line' : 'ri-edit-line'} text-sm`}></i>
                  </button>
                  <button
                    onClick={() => removeLink(index)}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>
              {editingLink === index && (
                <div className="border-t border-slate-700 p-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Link-Text</label>
                    <input
                      type="text"
                      value={link.label}
                      onChange={e => updateLink(index, 'label', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Ziel-Sektion (ID)</label>
                    <input
                      type="text"
                      value={link.target}
                      onChange={e => updateLink(index, 'target', e.target.value)}
                      placeholder="z.B. features, pricing"
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-cursor-line text-[#C9A961]"></i> CTA-Button
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Button-Text</label>
            <input
              type="text"
              value={data.ctaText}
              onChange={e => setData(prev => ({ ...prev, ctaText: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Button-URL</label>
            <input
              type="text"
              value={data.ctaUrl}
              onChange={e => setData(prev => ({ ...prev, ctaUrl: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <p className="text-slate-400 text-xs mb-2">Vorschau:</p>
          <a className="inline-block px-6 py-2 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold text-sm cursor-pointer">
            {data.ctaText}
          </a>
        </div>
      </div>
    </div>
  );
}
