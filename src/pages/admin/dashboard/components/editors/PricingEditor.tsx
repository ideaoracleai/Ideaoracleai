import { useState, useEffect } from 'react';
import { defaultPricingData } from '../../../../../mocks/websiteDefaults';

interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  credits: string;
  features: string[];
  negativeFeatures: number[];
  specialFeatures?: number[];
  highlighted: boolean;
}

interface Props {
  onSave: () => void;
}

export default function PricingEditor({ onSave }: Props) {
  const [data, setData] = useState(defaultPricingData);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('website_pricing');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved pricing data:', e);
        // fallback to defaults – nothing else needed
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('website_pricing', JSON.stringify(data));
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('website_data_updated'));
      onSave();
    } catch (e) {
      console.error('Failed to save pricing data:', e);
    }
  };

  const handleReset = () => {
    setData(defaultPricingData);
    localStorage.removeItem('website_pricing');
    onSave();
  };

  const updatePlan = (
    planId: string,
    key: keyof Plan,
    value: string | boolean
  ) => {
    setData((prev) => ({
      ...prev,
      plans: prev.plans.map((p) =>
        p.id === planId ? { ...p, [key]: value } : p
      ),
    }));
  };

  const updateFeature = (planId: string, featureIndex: number, value: string) => {
    setData((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => {
        if (p.id !== planId) return p;
        const newFeatures = [...p.features];
        newFeatures[featureIndex] = value;
        return { ...p, features: newFeatures };
      }),
    }));
  };

  const addFeature = (planId: string) => {
    setData((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => {
        if (p.id !== planId) return p;
        return { ...p, features: [...p.features, 'Neues Feature'] };
      }),
    }));
  };

  const removeFeature = (planId: string, featureIndex: number) => {
    setData((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => {
        if (p.id !== planId) return p;
        const newFeatures = p.features.filter((_, i) => i !== featureIndex);
        const newNeg = p.negativeFeatures
          .filter((i) => i !== featureIndex)
          .map((i) => (i > featureIndex ? i - 1 : i));
        const newSpec = (p.specialFeatures || [])
          .filter((i) => i !== featureIndex)
          .map((i) => (i > featureIndex ? i - 1 : i));
        return {
          ...p,
          features: newFeatures,
          negativeFeatures: newNeg,
          specialFeatures: newSpec,
        };
      }),
    }));
  };

  const toggleHighlighted = (planId: string) => {
    setData((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => ({
        ...p,
        highlighted: p.id === planId ? !p.highlighted : false,
      })),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">
            Pakete & Preise bearbeiten
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            Namen, Preise, Credits und Features der Pakete
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

      {/* Titel & Untertitel */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-heading text-[#C9A961]"></i> Bereichs‑Überschrift
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Titel</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) =>
                setData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              Untertitel
            </label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) =>
                setData((prev) => ({ ...prev, subtitle: e.target.value }))
              }
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
      </div>

      {/* Pakete */}
      <div className="grid grid-cols-1 gap-4">
        {data.plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-slate-800/50 rounded-xl border transition-all ${
              plan.highlighted ? 'border-[#C9A961]' : 'border-slate-700'
            }`}
          >
            {/* Plan Header */}
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    plan.highlighted ? 'bg-[#C9A961]/20' : 'bg-slate-700'
                  }`}
                >
                  <i
                    className={`ri-vip-crown-line text-lg ${
                      plan.highlighted ? 'text-[#C9A961]' : 'text-slate-400'
                    }`}
                  ></i>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{plan.name}</h4>
                  <p className="text-slate-400 text-sm">{plan.price} CHF/Monat</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleHighlighted(plan.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    plan.highlighted
                      ? 'bg-[#C9A961] text-[#0F1419]'
                      : 'bg-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {plan.highlighted ? '★ Hervorgehoben' : 'Hervorheben'}
                </button>
                <button
                  onClick={() =>
                    setEditingPlan(editingPlan === plan.id ? null : plan.id)
                  }
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                >
                  <i
                    className={`${
                      editingPlan === plan.id
                        ? 'ri-arrow-up-s-line'
                        : 'ri-edit-line'
                    }`}
                  ></i>
                  {editingPlan === plan.id ? 'Schließen' : 'Bearbeiten'}
                </button>
              </div>
            </div>

            {/* Plan Editor */}
            {editingPlan === plan.id && (
              <div className="border-t border-slate-700 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">
                      Paketname
                    </label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) =>
                        updatePlan(plan.id, 'name', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">
                      Preis (CHF)
                    </label>
                    <input
                      type="text"
                      value={plan.price}
                      onChange={(e) =>
                        updatePlan(plan.id, 'price', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">
                      Beschreibung
                    </label>
                    <input
                      type="text"
                      value={plan.description}
                      onChange={(e) =>
                        updatePlan(plan.id, 'description', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">
                      Credits-Text
                    </label>
                    <input
                      type="text"
                      value={plan.credits}
                      onChange={(e) =>
                        updatePlan(plan.id, 'credits', e.target.value)
                      }
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="text-slate-400 text-xs mb-2 block">
                    Features
                  </label>
                  <div className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs w-6 text-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            updateFeature(plan.id, idx, e.target.value)
                          }
                          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                        />
                        <button
                          onClick={() => removeFeature(plan.id, idx)}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addFeature(plan.id)}
                    className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                  >
                    <i className="ri-add-line"></i> Feature hinzufügen
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
