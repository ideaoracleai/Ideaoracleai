import { useState, useEffect } from 'react';
import { defaultLegalData } from '../../../../../mocks/websiteDefaults';

interface LegalSection {
  title: string;
  content: string;
}

interface Props {
  onSave: () => void;
}

type LegalTab = 'privacy' | 'terms' | 'imprint';

export default function LegalEditor({ onSave }: Props) {
  const [activeTab, setActiveTab] = useState<LegalTab>('terms');
  const [data, setData] = useState(defaultLegalData);
  const [editingSection, setEditingSection] = useState<number | null>(null);

  // Load persisted data
  useEffect(() => {
    const saved = localStorage.getItem('website_legal');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        // If JSON is corrupted, fallback to defaults
        console.warn('Failed to parse saved legal data, using defaults.');
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('website_legal', JSON.stringify(data));
      onSave();
    } catch (e) {
      console.error('Failed to save legal data:', e);
    }
  };

  const handleReset = () => {
    setData(defaultLegalData);
    localStorage.removeItem('website_legal');
    onSave();
  };

  const current = activeTab === 'privacy' ? data.privacy : activeTab === 'terms' ? data.terms : data.imprint;

  const updateField = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [field]: value }
    }));
  };

  const updateSection = (index: number, key: keyof LegalSection, value: string) => {
    setData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        sections: prev[activeTab].sections.map((s, i) =>
          i === index ? { ...s, [key]: value } : s
        )
      }
    }));
  };

  const addSection = () => {
    setData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        sections: [
          ...prev[activeTab].sections,
          {
            title: `${prev[activeTab].sections.length + 1}. Neuer Abschnitt`,
            content: 'Inhalt hier eingeben...'
          }
        ]
      }
    }));
    // Set editing to the newly added section
    setEditingSection(current.sections.length);
  };

  const removeSection = (index: number) => {
    setData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        sections: prev[activeTab].sections.filter((_, i) => i !== index)
      }
    }));
    if (editingSection === index) setEditingSection(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Rechtliche Seiten bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">AGB, Datenschutz & Impressum verwalten</p>
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

      {/* Tab toggle */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-fit">
        <button
          onClick={() => {
            setActiveTab('terms');
            setEditingSection(null);
          }}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'terms'
              ? 'bg-[#C9A961] text-[#0F1419]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-file-text-line mr-2"></i>AGB
        </button>
        <button
          onClick={() => {
            setActiveTab('privacy');
            setEditingSection(null);
          }}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-[#C9A961] text-[#0F1419]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-shield-check-line mr-2"></i>Datenschutz
        </button>
        <button
          onClick={() => {
            setActiveTab('imprint');
            setEditingSection(null);
          }}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'imprint'
              ? 'bg-[#C9A961] text-[#0F1419]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <i className="ri-building-line mr-2"></i>Impressum
        </button>
      </div>

      {/* Meta information */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-information-line text-[#C9A961]"></i> Allgemein
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Seitentitel</label>
            <input
              type="text"
              value={current.title}
              onChange={e => updateField('title', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Zuletzt aktualisiert</label>
            <input
              type="text"
              value={current.lastUpdated}
              onChange={e => updateField('lastUpdated', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Kontakt-E-Mail</label>
            <input
              type="text"
              value={current.contactEmail}
              onChange={e => updateField('contactEmail', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Adresse</label>
            <input
              type="text"
              value={current.contactAddress}
              onChange={e => updateField('contactAddress', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
      </div>

      {/* Sections header */}
      <div className="flex items-center justify-between">
        <h4 className="text-white font-semibold">
          Abschnitte ({current.sections.length})
        </h4>
        <button
          onClick={addSection}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
        >
          <i className="ri-add-line"></i> Abschnitt hinzufügen
        </button>
      </div>

      {/* Sections list */}
      <div className="space-y-3">
        {current.sections.map((section, index) => (
          <div key={index} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-slate-500 text-xs font-mono w-6 text-center flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-white font-medium text-sm truncate">{section.title}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                <button
                  onClick={() =>
                    setEditingSection(editingSection === index ? null : index)
                  }
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#C9A961] hover:bg-[#C9A961]/10 rounded-md transition-all cursor-pointer"
                >
                  <i
                    className={`${
                      editingSection === index ? 'ri-arrow-up-s-line' : 'ri-edit-line'
                    } text-sm`}
                  ></i>
                </button>
                <button
                  onClick={() => removeSection(index)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>

            {editingSection === index && (
              <div className="border-t border-slate-700 p-4 space-y-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Überschrift</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={e => updateSection(index, 'title', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Inhalt</label>
                  <textarea
                    value={section.content}
                    onChange={e => updateSection(index, 'content', e.target.value)}
                    rows={6}
                    maxLength={500}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
                  />
                  <p className="text-slate-500 text-xs mt-1 text-right">
                    {section.content.length}/500
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
