
import { useState, useEffect } from 'react';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  section: string;
  width: number;
  height: number;
  description: string;
}

const defaultMedia: MediaItem[] = [
  {
    id: 'hero-bg',
    name: 'Hero Hintergrundbild',
    url: 'https://readdy.ai/api/search-image?query=modern%20business%20technology%20abstract%20background%20with%20data%20visualization%20and%20digital%20innovation%20elements%2C%20professional%20corporate%20design%2C%20clean%20minimalist%20aesthetic%2C%20soft%20gradient%20lighting%2C%20contemporary%20workspace%20atmosphere%2C%20high%20quality%20digital%20art%2C%20neutral%20sophisticated%20tones&width=1920&height=1080&seq=herobg1&orientation=landscape',
    section: 'Hero',
    width: 1920,
    height: 1080,
    description: 'Hauptbild im Hero-Bereich',
  },
  {
    id: 'features-main',
    name: 'Features Hauptbild',
    url: 'https://readdy.ai/api/search-image?query=advanced%20business%20intelligence%20platform%20interface%20with%20data%20analytics%20charts%20and%20graphs%2C%20modern%20corporate%20technology%2C%20clean%20white%20background%2C%20professional%20dashboard%20design%2C%20minimalist%20aesthetic%2C%20soft%20lighting%2C%20contemporary%20digital%20workspace%2C%20high%20quality%20visualization%2C%20neutral%20tones&width=700&height=900&seq=feature1&orientation=portrait',
    section: 'Features',
    width: 700,
    height: 900,
    description: 'Hauptbild im Features-Bereich',
  },
];

export default function MediaEditor() {
  // State handling
  const [media, setMedia] = useState<MediaItem[]>(defaultMedia);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load persisted media once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('websiteMedia');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Basic validation – ensure we have an array of objects with required fields
        if (Array.isArray(parsed) && parsed.every((m) => typeof m.id === 'string')) {
          setMedia(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse stored media:', err);
    }
  }, []);

  // Save to localStorage and emit a custom event
  const handleSave = () => {
    try {
      localStorage.setItem('websiteMedia', JSON.stringify(media));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new CustomEvent('websiteMediaUpdated', { detail: media }));
    } catch (err) {
      console.error('Unable to save media:', err);
    }
  };

  // Update a single field of a media item
  const handleUpdate = (id: string, field: keyof MediaItem, value: string | number) => {
    setMedia((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Add a new custom item
  const handleAdd = () => {
    const newItem: MediaItem = {
      id: `custom-${Date.now()}`,
      name: 'Neues Bild',
      url: '',
      section: 'Custom',
      width: 1200,
      height: 800,
      description: '',
    };
    setMedia((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
  };

  // Delete an item after confirmation
  const handleDelete = (id: string) => {
    if (window.confirm('Möchtest du dieses Bild wirklich löschen?')) {
      setMedia((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Reset to default media list
  const handleReset = () => {
    if (window.confirm('Alle Bilder auf Standard zurücksetzen?')) {
      setMedia(defaultMedia);
    }
  };

  // Helper to render fallback image when loading fails
  const renderFallbackImage = () => (
    <div className="w-full h-full flex items-center justify-center text-slate-500">
      <i className="ri-image-line text-3xl" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Medien-Verwaltung</h3>
          <p className="text-slate-400 text-sm">Bilder für alle Bereiche verwalten</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-[#C9A961] hover:bg-[#B89951] text-white rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <i className="ri-add-line" />
          Bild hinzufügen
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <i className="ri-information-line text-blue-400 text-xl" />
          <div className="flex-1">
            <p className="text-blue-300 font-medium mb-1">Empfohlene Bildgrößen</p>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Hero-Hintergrund: 1920x1080px (Landscape)</li>
              <li>• Features-Bilder: 700x900px (Portrait)</li>
              <li>• Testimonial-Avatare: 100x100px (Square)</li>
              <li>• Logo: 200x60px (Landscape)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Media List */}
      <div className="space-y-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-32 h-32 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0">
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23334155" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="14"%3EKein Bild%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    renderFallbackImage()
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                        placeholder="Bildname"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Bereich
                      </label>
                      <input
                        type="text"
                        value={item.section}
                        onChange={(e) => handleUpdate(item.id, 'section', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                        placeholder="z.B. Hero, Features"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Bild-URL *
                    </label>
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => handleUpdate(item.id, 'url', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Breite (px)
                      </label>
                      <input
                        type="number"
                        value={item.width}
                        onChange={(e) =>
                          handleUpdate(item.id, 'width', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Höhe (px)
                      </label>
                      <input
                        type="number"
                        value={item.height}
                        onChange={(e) =>
                          handleUpdate(item.id, 'height', parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Verhältnis
                      </label>
                      <div className="px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-400 text-sm">
                        {(item.width / item.height).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Beschreibung
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                      placeholder="Optionale Beschreibung"
                    />
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                >
                  <i className="ri-delete-bin-line" />
                </button>
              </div>
            </div>
          </div>
        ))}
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
