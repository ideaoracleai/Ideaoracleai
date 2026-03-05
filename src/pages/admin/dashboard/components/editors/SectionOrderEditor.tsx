
import { useState, useEffect } from 'react';

interface Section {
  id: string;
  name: string;
  icon: string;
  visible: boolean;
  order: number;
}

const defaultSections: Section[] = [
  { id: 'hero', name: 'Hero-Bereich', icon: 'ri-home-line', visible: true, order: 0 },
  { id: 'features', name: 'Features', icon: 'ri-star-line', visible: true, order: 1 },
  { id: 'howitworks', name: "So funktioniert's", icon: 'ri-list-ordered', visible: true, order: 2 },
  { id: 'testimonials', name: 'Testimonials', icon: 'ri-chat-quote-line', visible: true, order: 3 },
  { id: 'about', name: 'Über uns', icon: 'ri-information-line', visible: true, order: 4 },
  { id: 'pricing', name: 'Preise', icon: 'ri-price-tag-3-line', visible: true, order: 5 },
  { id: 'faq', name: 'FAQ', icon: 'ri-question-line', visible: true, order: 6 },
  { id: 'cta', name: 'Call-to-Action', icon: 'ri-megaphone-line', visible: true, order: 7 }
];

export default function SectionOrderEditor() {
  // ---------- State ----------
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  // ---------- Effects ----------
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sectionOrder');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate parsed data before applying it
        if (Array.isArray(parsed) && parsed.every(item => typeof item.id === 'string')) {
          setSections(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved section order:', e);
    }
  }, []);

  // ---------- Handlers ----------
  const handleSave = () => {
    try {
      localStorage.setItem('sectionOrder', JSON.stringify(sections));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Notify other parts of the app about the change
      window.dispatchEvent(new CustomEvent('sectionOrderUpdated', { detail: sections }));
    } catch (e) {
      console.error('Failed to save section order:', e);
    }
  };

  const handleToggleVisibility = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setSections(prev => {
      const newSections = [...prev];
      const [moved] = newSections.splice(draggedIndex, 1);
      newSections.splice(index, 0, moved);
      // Re‑assign order values
      newSections.forEach((s, i) => (s.order = i));
      return newSections;
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleReset = () => {
    setSections(defaultSections);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      newSections.forEach((s, i) => (s.order = i));
      return newSections;
    });
  };

  const moveDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections(prev => {
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      newSections.forEach((s, i) => (s.order = i));
      return newSections;
    });
  };

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Sektions‑Verwaltung</h3>
        <p className="text-slate-400 text-sm">
          Reihenfolge ändern und Sektionen ein‑/ausblenden
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
          <i className="ri-information-line"></i>
          <span>Ziehe die Sektionen, um die Reihenfolge zu ändern</span>
        </div>

        <div className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={e => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-4 bg-slate-900 rounded-lg border border-slate-700 cursor-move transition-all ${
                draggedIndex === index ? 'opacity-50' : 'hover:border-slate-600'
              }`}
            >
              {/* Drag Handle */}
              <div className="flex flex-col gap-1 text-slate-500">
                <i className="ri-drag-move-line text-lg"></i>
              </div>

              {/* Order Number */}
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 font-bold text-sm">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-10 h-10 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
                <i className={`${section.icon} text-[#C9A961] text-lg`}></i>
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className="text-white font-medium">{section.name}</p>
                <p className="text-slate-500 text-xs">ID: {section.id}</p>
              </div>

              {/* Visibility Toggle */}
              <button
                onClick={() => handleToggleVisibility(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  section.visible
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {section.visible ? (
                  <>
                    <i className="ri-eye-line mr-1"></i> Sichtbar
                  </>
                ) : (
                  <>
                    <i className="ri-eye-off-line mr-1"></i> Versteckt
                  </>
                )}
              </button>

              {/* Move Buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="w-8 h-8 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-slate-300 transition-all"
                >
                  <i className="ri-arrow-up-line"></i>
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === sections.length - 1}
                  className="w-8 h-8 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-slate-300 transition-all"
                >
                  <i className="ri-arrow-down-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Gesamt</p>
          <p className="text-2xl font-bold text-white">{sections.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Sichtbar</p>
          <p className="text-2xl font-bold text-green-400">
            {sections.filter(s => s.visible).length}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Versteckt</p>
          <p className="text-2xl font-bold text-slate-400">
            {sections.filter(s => !s.visible).length}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-[#C9A961] hover:bg-[#B89951] text-white rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap"
        >
          {saved ? '✓ Gespeichert!' : 'Speichern'}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}
