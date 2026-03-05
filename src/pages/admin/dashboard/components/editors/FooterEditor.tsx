import { useState, useEffect } from 'react';
import { defaultFooterData } from '../../../../../mocks/websiteDefaults';

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterData {
  description: string;
  columns: {
    product: FooterColumn;
    legal: FooterColumn;
    support: FooterColumn;
  };
  copyright: string;
  readyLink: {
    text: string;
    url: string;
  };
}

export default function FooterEditor() {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('website_footer');
    if (saved) {
      try {
        setFooterData(JSON.parse(saved));
      } catch (e) {
        console.error('Fehler beim Laden der Footer-Daten:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('website_footer', JSON.stringify(footerData));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('website_data_updated'));
    alert('Footer gespeichert!');
  };

  const handleReset = () => {
    if (confirm('Möchtest du wirklich alle Footer-Änderungen zurücksetzen?')) {
      setFooterData(defaultFooterData);
      localStorage.removeItem('website_footer');
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const updateDescription = (value: string) => {
    setFooterData({ ...footerData, description: value });
  };

  const updateColumnTitle = (column: 'product' | 'legal' | 'support', value: string) => {
    setFooterData({
      ...footerData,
      columns: {
        ...footerData.columns,
        [column]: {
          ...footerData.columns[column],
          title: value
        }
      }
    });
  };

  const updateLink = (column: 'product' | 'legal' | 'support', index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...footerData.columns[column].links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFooterData({
      ...footerData,
      columns: {
        ...footerData.columns,
        [column]: {
          ...footerData.columns[column],
          links: newLinks
        }
      }
    });
  };

  const addLink = (column: 'product' | 'legal' | 'support') => {
    setFooterData({
      ...footerData,
      columns: {
        ...footerData.columns,
        [column]: {
          ...footerData.columns[column],
          links: [...footerData.columns[column].links, { label: 'Neuer Link', url: '#' }]
        }
      }
    });
  };

  const removeLink = (column: 'product' | 'legal' | 'support', index: number) => {
    const newLinks = footerData.columns[column].links.filter((_, i) => i !== index);
    setFooterData({
      ...footerData,
      columns: {
        ...footerData.columns,
        [column]: {
          ...footerData.columns[column],
          links: newLinks
        }
      }
    });
  };

  const updateCopyright = (value: string) => {
    setFooterData({ ...footerData, copyright: value });
  };

  const updateReadyLink = (field: 'text' | 'url', value: string) => {
    setFooterData({
      ...footerData,
      readyLink: {
        ...footerData.readyLink,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Footer bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">Beschreibung, Links und Copyright anpassen</p>
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
            <i className="ri-save-line"></i> {isSaved ? 'Gespeichert!' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Beschreibung */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
          <i className="ri-text text-[#C9A961]"></i> Beschreibungstext
        </h4>
        <textarea
          value={footerData.description}
          onChange={(e) => updateDescription(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
          placeholder="Kurze Beschreibung deiner Plattform..."
        />
      </div>

      {/* Spalten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Produkt-Spalte */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="mb-4">
            <label className="text-slate-400 text-xs mb-1 block">Spalte 1: Titel</label>
            <input
              type="text"
              value={footerData.columns.product.title}
              onChange={(e) => updateColumnTitle('product', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-400 text-xs block">Links</label>
            {footerData.columns.product.links.map((link, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Link {index + 1}</span>
                  <button
                    onClick={() => removeLink('product', index)}
                    className="text-red-400 hover:text-red-300 text-xs cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink('product', index, 'label', e.target.value)}
                  placeholder="Link-Text"
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLink('product', index, 'url', e.target.value)}
                  placeholder="URL"
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
            ))}
            <button
              onClick={() => addLink('product')}
              className="w-full px-3 py-2 text-sm text-[#C9A961] border border-[#C9A961]/30 rounded-lg hover:bg-[#C9A961]/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              + Link hinzufügen
            </button>
          </div>
        </div>

        {/* Rechtliches-Spalte */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="mb-4">
            <label className="text-slate-400 text-xs mb-1 block">Spalte 2: Titel</label>
            <input
              type="text"
              value={footerData.columns.legal.title}
              onChange={(e) => updateColumnTitle('legal', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-400 text-xs block">Links</label>
            {footerData.columns.legal.links.map((link, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Link {index + 1}</span>
                  <button
                    onClick={() => removeLink('legal', index)}
                    className="text-red-400 hover:text-red-300 text-xs cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink('legal', index, 'label', e.target.value)}
                  placeholder="Link-Text"
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLink('legal', index, 'url', e.target.value)}
                  placeholder="URL"
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
            ))}
            <button
              onClick={() => addLink('legal')}
              className="w-full px-3 py-2 text-sm text-[#C9A961] border border-[#C9A961]/30 rounded-lg hover:bg-[#C9A961]/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              + Link hinzufügen
            </button>
          </div>
        </div>

        {/* Support-Spalte */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <div className="mb-4">
            <label className="text-slate-400 text-xs mb-1 block">Spalte 3: Titel</label>
            <input
              type="text"
              value={footerData.columns.support.title}
              onChange={(e) => updateColumnTitle('support', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-400 text-xs block">Links</label>
            {footerData.columns.support.links.map((link, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-xs">Link {index + 1}</span>
                  <button
                    onClick={() => removeLink('support', index)}
                    className="text-red-400 hover:text-red-300 text-xs cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink('support', index, 'label', e.target.value)}
                  placeholder="Link-Text"
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLink('support', index, 'url', e.target.value)}
                  placeholder="URL"
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
            ))}
            <button
              onClick={() => addLink('support')}
              className="w-full px-3 py-2 text-sm text-[#C9A961] border border-[#C9A961]/30 rounded-lg hover:bg-[#C9A961]/10 transition-colors cursor-pointer whitespace-nowrap"
            >
              + Link hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Copyright & Readdy Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <label className="text-slate-400 text-xs mb-2 block">Copyright-Text</label>
          <input
            type="text"
            value={footerData.copyright}
            onChange={(e) => updateCopyright(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            placeholder="© 2024 IdeaOracle.ai..."
          />
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
          <label className="text-slate-400 text-xs mb-2 block">Readdy-Link (Quick Link)</label>
          <div className="space-y-2">
            <input
              type="text"
              value={footerData.readyLink.text}
              onChange={(e) => updateReadyLink('text', e.target.value)}
              placeholder="Link-Text"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
            <input
              type="text"
              value={footerData.readyLink.url}
              onChange={(e) => updateReadyLink('url', e.target.value)}
              placeholder="URL"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
