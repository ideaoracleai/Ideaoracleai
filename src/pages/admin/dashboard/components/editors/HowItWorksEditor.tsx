
import { useState, useEffect } from 'react';
import { defaultHowItWorksData } from '../../../../../mocks/websiteDefaults';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

interface HowItWorksData {
  title: string;
  subtitle: string;
  steps: Step[];
}

export default function HowItWorksEditor() {
  const [data, setData] = useState<HowItWorksData>(defaultHowItWorksData);
  const [editingStep, setEditingStep] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('website_howitworks');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse how it works data:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('website_howitworks', JSON.stringify(data));
    window.dispatchEvent(new Event('website_data_updated'));
    alert('Schritte gespeichert!');
  };

  const handleReset = () => {
    setData(defaultHowItWorksData);
    localStorage.removeItem('website_howitworks');
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    setData(prev => ({
      ...prev,
      steps: prev.steps.map((s, i) => 
        i === index ? { ...s, [field]: value } : s
      )
    }));
  };

  const addStep = () => {
    const newNumber = String(data.steps.length + 1).padStart(2, '0');
    setData(prev => ({
      ...prev,
      steps: [...prev.steps, {
        number: newNumber,
        title: 'Neuer Schritt',
        description: 'Beschreibung hier eingeben...',
        icon: 'ri-star-line'
      }]
    }));
    setEditingStep(data.steps.length);
  };

  const removeStep = (index: number) => {
    setData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((s, i) => ({
        ...s,
        number: String(i + 1).padStart(2, '0')
      }))
    }));
    if (editingStep === index) setEditingStep(null);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= data.steps.length) return;
    const newSteps = [...data.steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    // Update numbers
    newSteps.forEach((s, i) => {
      s.number = String(i + 1).padStart(2, '0');
    });
    setData(prev => ({ ...prev, steps: newSteps }));
  };

  const iconOptions = [
    'ri-shopping-bag-3-line', 'ri-question-answer-line', 'ri-shield-check-line', 'ri-checkbox-circle-line',
    'ri-user-add-line', 'ri-edit-line', 'ri-search-line', 'ri-lightbulb-line',
    'ri-rocket-line', 'ri-trophy-line', 'ri-star-line', 'ri-heart-line',
    'ri-thumb-up-line', 'ri-check-double-line', 'ri-send-plane-line', 'ri-magic-line'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">So funktioniert's bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">Schritte und Beschreibungen anpassen</p>
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

      {/* Bereichs-Überschrift */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-heading text-[#C9A961]"></i> Bereichs-Überschrift
        </h4>
        <div className="grid grid-cols-2 gap-4">
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
            <label className="text-slate-400 text-xs mb-1 block">Untertitel</label>
            <input
              type="text"
              value={data.subtitle}
              onChange={e => setData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
      </div>

      {/* Schritte */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <i className="ri-list-ordered text-[#C9A961]"></i> Schritte ({data.steps.length})
          </h4>
          <button
            onClick={addStep}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <i className="ri-add-line"></i> Schritt hinzufügen
          </button>
        </div>

        <div className="space-y-3">
          {data.steps.map((step, index) => (
            <div key={index} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-xl flex items-center justify-center">
                    <i className={`${step.icon} text-[#0F1419] text-xl`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#C9A961] text-xs font-mono">{step.number}</span>
                      <p className="text-white font-medium">{step.title}</p>
                    </div>
                    <p className="text-slate-400 text-xs truncate max-w-md">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-all cursor-pointer disabled:opacity-30"
                  >
                    <i className="ri-arrow-up-s-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === data.steps.length - 1}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-all cursor-pointer disabled:opacity-30"
                  >
                    <i className="ri-arrow-down-s-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => setEditingStep(editingStep === index ? null : index)}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#C9A961] hover:bg-[#C9A961]/10 rounded-md transition-all cursor-pointer"
                  >
                    <i className={`${editingStep === index ? 'ri-arrow-up-s-line' : 'ri-edit-line'} text-sm`}></i>
                  </button>
                  <button
                    onClick={() => removeStep(index)}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>

              {editingStep === index && (
                <div className="border-t border-slate-700 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Titel</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={e => updateStep(index, 'title', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Beschreibung</label>
                      <input
                        type="text"
                        value={step.description}
                        onChange={e => updateStep(index, 'description', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-2 block">Icon</label>
                    <div className="grid grid-cols-8 gap-2">
                      {iconOptions.map(icon => (
                        <button
                          key={icon}
                          onClick={() => updateStep(index, 'icon', icon)}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            step.icon === icon
                              ? 'bg-[#C9A961] text-[#0F1419]'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          <i className={`${icon} text-lg`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vorschau */}
      <div className="bg-slate-800/30 rounded-xl border border-dashed border-slate-600 p-4 flex items-center gap-3">
        <i className="ri-information-line text-[#C9A961] text-xl"></i>
        <p className="text-slate-400 text-sm">
          Die Schritt-Nummern werden automatisch aktualisiert, wenn du Schritte hinzufügst, löschst oder verschiebst.
        </p>
      </div>
    </div>
  );
}
