
import { useState, useEffect } from 'react';

interface DesignSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  fontFamily: string;
  headingFont: string;
}

const googleFonts = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Raleway', value: 'Raleway, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
];

export default function DesignEditor() {
  const [settings, setSettings] = useState<DesignSettings>({
    primaryColor: '#C9A961',
    secondaryColor: '#7BA882',
    accentColor: '#D4A5A5',
    backgroundColor: '#FFFFFF',
    textColor: '#1E293B',
    headingColor: '#0F172A',
    fontFamily: 'Inter, sans-serif',
    headingFont: 'Inter, sans-serif',
  });

  const [saved, setSaved] = useState(false);

  // Load saved settings from localStorage (if any)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('websiteDesign');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate parsed object before applying
        if (parsed && typeof parsed === 'object') {
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (error) {
      console.error('Failed to load design settings from localStorage:', error);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('websiteDesign', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Dispatch a custom event so other parts of the app can react
      window.dispatchEvent(
        new CustomEvent('websiteDesignUpdated', { detail: settings })
      );
    } catch (error) {
      console.error('Failed to save design settings:', error);
    }
  };

  const handleReset = () => {
    const defaults: DesignSettings = {
      primaryColor: '#C9A961',
      secondaryColor: '#7BA882',
      accentColor: '#D4A5A5',
      backgroundColor: '#FFFFFF',
      textColor: '#1E293B',
      headingColor: '#0F172A',
      fontFamily: 'Inter, sans-serif',
      headingFont: 'Inter, sans-serif',
    };
    setSettings(defaults);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1">
          Design‑Einstellungen
        </h3>
        <p className="text-slate-400 text-sm">
          Globale Farben und Schriftarten für die gesamte Website
        </p>
      </div>

      {/* Farben */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
          Farben
        </h4>

        <div className="grid grid-cols-2 gap-4">
          {/* Primary */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Primärfarbe *
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
                className="w-16 h-10 rounded-lg cursor-pointer border border-slate-600"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, primaryColor: e.target.value })
                }
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                placeholder="#C9A961"
              />
            </div>
          </div>

          {/* Secondary */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sekundärfarbe *
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryColor: e.target.value })
                }
                className="w-16 h-10 rounded-lg cursor-pointer border border-slate-600"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) =>
                  setSettings({ ...settings, secondaryColor: e.target.value })
                }
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                placeholder="#7BA882"
              />
            </div>
          </div>

          {/* Accent */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Akzentfarbe *
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) =>
                  setSettings({ ...settings, accentColor: e.target.value })
                }
                className="w-16 h-10 rounded-lg cursor-pointer border border-slate-600"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) =>
                  setSettings({ ...settings, accentColor: e.target.value })
                }
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                placeholder="#D4A5A5"
              />
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hintergrundfarbe *
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) =>
                  setSettings({ ...settings, backgroundColor: e.target.value })
                }
                className="w-16 h-10 rounded-lg cursor-pointer border border-slate-600"
              />
              <input
                type="text"
                value={settings.backgroundColor}
                onChange={(e) =>
                  setSettings({ ...settings, backgroundColor: e.target.value })
                }
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                placeholder="#FFFFFF"
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Textfarbe *
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.textColor}
                onChange={(e) =>
                  setSettings({ ...settings, textColor: e.target.value })
                }
                className="w-16 h-10 rounded-lg cursor-pointer border border-slate-600"
              />
              <input
                type="text"
                value={settings.textColor}
                onChange={(e) =>
                  setSettings({ ...settings, textColor: e.target.value })
                }
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                placeholder="#1E293B"
              />
            </div>
          </div>

          {/* Heading */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Überschriftenfarbe *
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.headingColor}
                onChange={(e) =>
                  setSettings({ ...settings, headingColor: e.target.value })
                }
                className="w-16 h-10 rounded-lg cursor-pointer border border-slate-600"
              />
              <input
                type="text"
                value={settings.headingColor}
                onChange={(e) =>
                  setSettings({ ...settings, headingColor: e.target.value })
                }
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                placeholder="#0F172A"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schriftarten */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
          Schriftarten
        </h4>

        <div className="grid grid-cols-2 gap-4">
          {/* Body font */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hauptschrift (Body) *
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) =>
                setSettings({ ...settings, fontFamily: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm cursor-pointer"
            >
              {googleFonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Heading font */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Überschriften‑Schrift *
            </label>
            <select
              value={settings.headingFont}
              onChange={(e) =>
                setSettings({ ...settings, headingFont: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm cursor-pointer"
            >
              {googleFonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vorschau */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Vorschau
        </h4>
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: settings.backgroundColor,
            fontFamily: settings.fontFamily,
          }}
        >
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              color: settings.headingColor,
              fontFamily: settings.headingFont,
            }}
          >
            Überschrift
          </h1>
          <p style={{ color: settings.textColor }} className="mb-4">
            Dies ist ein Beispieltext, um die Schriftart und Farben zu demonstrieren.
          </p>
          <button
            className="px-6 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: settings.primaryColor }}
          >
            Primär‑Button
          </button>
        </div>
      </div>

      {/* Action buttons */}
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
