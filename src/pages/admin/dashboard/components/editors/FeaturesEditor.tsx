
import { useState, useEffect } from 'react';
import { defaultFeaturesData } from '../../../../../mocks/websiteDefaults';

interface Feature {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
}

interface FeaturesData {
  title1: string;
  title2: string;
  title3: string;
  mainFeature: {
    title: string;
    description: string;
    image: string;
  };
  features: Feature[];
}

export default function FeaturesEditor() {
  const [data, setData] = useState<FeaturesData>(defaultFeaturesData);
  const [editingFeature, setEditingFeature] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('website_features');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse features data:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('website_features', JSON.stringify(data));
    window.dispatchEvent(new Event('website_data_updated'));
    alert('Features gespeichert!');
  };

  const handleReset = () => {
    setData(defaultFeaturesData);
    localStorage.removeItem('website_features');
  };

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    setData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }));
  };

  const addFeature = () => {
    setData(prev => ({
      ...prev,
      features: [...prev.features, {
        title: 'Neues Feature',
        description: 'Beschreibung hier eingeben...',
        icon: 'ri-star-line',
        bgColor: '#7BA882'
      }]
    }));
    setEditingFeature(data.features.length);
  };

  const removeFeature = (index: number) => {
    setData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
    if (editingFeature === index) setEditingFeature(null);
  };

  const iconOptions = [
    'ri-team-line', 'ri-shield-check-line', 'ri-rocket-line', 'ri-lightbulb-line',
    'ri-brain-line', 'ri-bar-chart-line', 'ri-lock-line', 'ri-speed-line',
    'ri-global-line', 'ri-customer-service-line', 'ri-award-line', 'ri-magic-line',
    'ri-flashlight-line', 'ri-heart-line', 'ri-thumb-up-line', 'ri-star-line'
  ];

  const colorOptions = [
    '#7BA882', '#D4A5A5', '#8B9DC3', '#C9A961', '#9B8AA5', '#A5C4D4',
    '#D4B896', '#96D4B8', '#D496B8', '#B8D496', '#96B8D4', '#D4D496'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Features bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">Titel, Beschreibungen und Icons anpassen</p>
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
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Teil 1</label>
            <input
              type="text"
              value={data.title1}
              onChange={e => setData(prev => ({ ...prev, title1: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Teil 2 (farbig)</label>
            <input
              type="text"
              value={data.title2}
              onChange={e => setData(prev => ({ ...prev, title2: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Teil 3</label>
            <input
              type="text"
              value={data.title3}
              onChange={e => setData(prev => ({ ...prev, title3: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4">
          <p className="text-slate-400 text-xs mb-2">Vorschau:</p>
          <p className="text-2xl font-bold text-white">
            {data.title1} <span className="text-[#C9A961]">{data.title2}</span> {data.title3}
          </p>
        </div>
      </div>

      {/* Haupt-Feature */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-layout-masonry-line text-[#C9A961]"></i> Haupt-Feature (großes Bild)
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Titel</label>
              <input
                type="text"
                value={data.mainFeature.title}
                onChange={e => setData(prev => ({ 
                  ...prev, 
                  mainFeature: { ...prev.mainFeature, title: e.target.value }
                }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Beschreibung</label>
              <textarea
                value={data.mainFeature.description}
                onChange={e => setData(prev => ({ 
                  ...prev, 
                  mainFeature: { ...prev.mainFeature, description: e.target.value }
                }))}
                rows={3}
                maxLength={500}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
              />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Bild-URL</label>
            <input
              type="text"
              value={data.mainFeature.image}
              onChange={e => setData(prev => ({ 
                ...prev, 
                mainFeature: { ...prev.mainFeature, image: e.target.value }
              }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
            <div className="mt-2 rounded-lg overflow-hidden h-32 bg-slate-900">
              <img 
                src={data.mainFeature.image} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature-Karten */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <i className="ri-grid-line text-[#C9A961]"></i> Feature-Karten ({data.features.length})
          </h4>
          <button
            onClick={addFeature}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <i className="ri-add-line"></i> Feature hinzufügen
          </button>
        </div>

        <div className="space-y-3">
          {data.features.map((feature, index) => (
            <div key={index} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <i className={`${feature.icon} text-white text-xl`}></i>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{feature.title}</p>
                    <p className="text-slate-400 text-xs truncate max-w-xs">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingFeature(editingFeature === index ? null : index)}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#C9A961] hover:bg-[#C9A961]/10 rounded-md transition-all cursor-pointer"
                  >
                    <i className={`${editingFeature === index ? 'ri-arrow-up-s-line' : 'ri-edit-line'} text-sm`}></i>
                  </button>
                  <button
                    onClick={() => removeFeature(index)}
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                  >
                    <i className="ri-delete-bin-line text-sm"></i>
                  </button>
                </div>
              </div>

              {editingFeature === index && (
                <div className="border-t border-slate-700 p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Titel</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={e => updateFeature(index, 'title', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Beschreibung</label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={e => updateFeature(index, 'description', e.target.value)}
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
                          onClick={() => updateFeature(index, 'icon', icon)}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            feature.icon === icon
                              ? 'bg-[#C9A961] text-[#0F1419]'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          <i className={`${icon} text-lg`}></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-2 block">Hintergrundfarbe</label>
                    <div className="flex gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          onClick={() => updateFeature(index, 'bgColor', color)}
                          className={`w-8 h-8 rounded-lg transition-all cursor-pointer ${
                            feature.bgColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
