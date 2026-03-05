
import { useState, useEffect } from 'react';

interface Version {
  id: string;
  timestamp: number;
  date: string;
  time: string;
  description: string;
  data: Record<string, string | null>;
}

export default function VersionHistoryEditor() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [autoSave, setAutoSave] = useState(true);

  // -------------------------------------------------------------------------
  // Load stored versions once & set up auto‑save listener
  // -------------------------------------------------------------------------
  useEffect(() => {
    loadVersions();

    const handleSave = () => {
      if (autoSave) {
        createVersion('Automatische Speicherung');
      }
    };

    window.addEventListener('websiteDataSaved', handleSave);
    return () => window.removeEventListener('websiteDataSaved', handleSave);
  }, [autoSave]);

  // -------------------------------------------------------------------------
  // Helper: read versions from localStorage
  // -------------------------------------------------------------------------
  const loadVersions = () => {
    try {
      const stored = localStorage.getItem('websiteVersions');
      if (stored) {
        setVersions(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load versions from localStorage', err);
    }
  };

  // -------------------------------------------------------------------------
  // Helper: create a new version entry
  // -------------------------------------------------------------------------
  const createVersion = (description: string) => {
    const now = new Date();

    const newVersion: Version = {
      id: `v-${Date.now()}`,
      timestamp: now.getTime(),
      date: now.toLocaleDateString('de-DE'),
      time: now.toLocaleTimeString('de-DE'),
      description,
      data: {
        hero: localStorage.getItem('heroData'),
        navbar: localStorage.getItem('navbarData'),
        features: localStorage.getItem('featuresData'),
        pricing: localStorage.getItem('pricingData'),
        faq: localStorage.getItem('faqData'),
        footer: localStorage.getItem('footerData'),
        design: localStorage.getItem('websiteDesign'),
        seo: localStorage.getItem('seoData')
      }
    };

    const updatedVersions = [newVersion, ...versions].slice(0, 20); // keep last 20
    setVersions(updatedVersions);
    localStorage.setItem('websiteVersions', JSON.stringify(updatedVersions));
  };

  // -------------------------------------------------------------------------
  // Restore a version (writes stored data back to localStorage)
  // -------------------------------------------------------------------------
  const restoreVersion = (version: Version) => {
    if (
      !window.confirm(
        `Version vom ${version.date} um ${version.time} wiederherstellen?\n\nAlle aktuellen Änderungen gehen verloren!`
      )
    ) {
      return;
    }

    Object.entries(version.data).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(key, value);
      }
    });

    // Notify other parts of the app and reload the page
    window.dispatchEvent(new CustomEvent('websiteVersionRestored'));
    alert('Version erfolgreich wiederhergestellt! Die Seite wird neu geladen.');
    window.location.reload();
  };

  // -------------------------------------------------------------------------
  // Delete a single version
  // -------------------------------------------------------------------------
  const deleteVersion = (id: string) => {
    if (!window.confirm('Diese Version wirklich löschen?')) return;

    const updated = versions.filter(v => v.id !== id);
    setVersions(updated);
    localStorage.setItem('websiteVersions', JSON.stringify(updated));
  };

  // -------------------------------------------------------------------------
  // Remove **all** versions
  // -------------------------------------------------------------------------
  const clearAllVersions = () => {
    if (
      !window.confirm(
        'Alle Versionen löschen? Dies kann nicht rückgängig gemacht werden!'
      )
    )
      return;

    setVersions([]);
    localStorage.removeItem('websiteVersions');
  };

  // -------------------------------------------------------------------------
  // Manual save triggered by the user
  // -------------------------------------------------------------------------
  const handleManualSave = () => {
    const description = window.prompt('Beschreibung für diese Version:');
    if (description) {
      createVersion(description);
      alert('Version gespeichert!');
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header + manual save */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            Versions‑Historie
          </h3>
          <p className="text-slate-400 text-sm">
            Automatische Backups und Wiederherstellung
          </p>
        </div>
        <button
          onClick={handleManualSave}
          className="px-4 py-2 bg-[#C9A961] hover:bg-[#B89951] text-white rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <i className="ri-save-line" />
          Jetzt speichern
        </button>
      </div>

      {/* Auto‑save toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
        <div>
          <p className="text-white font-medium">Automatische Speicherung</p>
          <p className="text-slate-400 text-sm">
            Erstellt automatisch eine Version bei jeder Änderung
          </p>
        </div>
        <button
          onClick={() => setAutoSave(!autoSave)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            autoSave
              ? 'bg-green-500/20 text-green-400'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {autoSave ? 'Aktiviert' : 'Deaktiviert'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Gespeicherte Versionen</p>
          <p className="text-2xl font-bold text-white">{versions.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Maximale Versionen</p>
          <p className="text-2xl font-bold text-slate-400">20</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Speicherplatz</p>
          <p className="text-2xl font-bold text-[#C9A961]">
            {(JSON.stringify(versions).length / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>

      {/* Versions List */}
      <div className="space-y-3">
        {versions.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center">
            <i className="ri-history-line text-4xl text-slate-600 mb-3" />
            <p className="text-slate-400">Noch keine Versionen gespeichert</p>
            <p className="text-slate-500 text-sm mt-1">
              Versionen werden automatisch erstellt, wenn du Änderungen
              speicherst
            </p>
          </div>
        ) : (
          versions.map((version, index) => (
            <div
              key={version.id}
              className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-[#C9A961]/20' : 'bg-slate-700'
                  }`}
                >
                  <i
                    className={`ri-history-line text-xl ${
                      index === 0 ? 'text-[#C9A961]' : 'text-slate-400'
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">
                        {version.description}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {version.date} um {version.time}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        Aktuell
                      </span>
                    )}
                  </div>

                  {/* Data Info */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(version.data).map(
                      ([key, value]) =>
                        value && (
                          <span
                            key={key}
                            className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                          >
                            {key}
                          </span>
                        )
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => restoreVersion(version)}
                      className="px-3 py-1.5 bg-[#C9A961] hover:bg-[#B89951] text-white rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                    >
                      <i className="ri-refresh-line" />
                      Wiederherstellen
                    </button>
                    <button
                      onClick={() => deleteVersion(version.id)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                    >
                      <i className="ri-delete-bin-line" />
                      Löschen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clear All */}
      {versions.length > 0 && (
        <button
          onClick={clearAllVersions}
          className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap"
        >
          Alle Versionen löschen
        </button>
      )}

      {/* Info panel */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <i className="ri-information-line text-blue-400 text-xl" />
          <div className="flex-1">
            <p className="text-blue-300 font-medium mb-1">Hinweis</p>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Versionen werden im Browser‑Speicher gespeichert</li>
              <li>• Maximal 20 Versionen werden aufbewahrt</li>
              <li>
                • Beim Löschen des Browser‑Cache gehen alle Versionen verloren
              </li>
              <li>• Nutze Import/Export für dauerhafte Backups</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
