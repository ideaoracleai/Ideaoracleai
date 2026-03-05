
import { useState } from 'react';

export default function ImportExportEditor() {
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const storageKeys = [
    'website_hero',
    'website_navbar',
    'website_features',
    'website_howitworks',
    'website_testimonials',
    'website_about',
    'website_cta',
    'website_pricing',
    'website_faq',
    'website_footer',
    'website_legal',
    'website_seo'
  ];

  const handleExport = () => {
    const data: Record<string, unknown> = {};
    storageKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    const jsonString = JSON.stringify(data, null, 2);
    setExportData(jsonString);
    setMessage({ type: 'success', text: 'Daten erfolgreich exportiert!' });
  };

  const handleDownload = () => {
    if (!exportData) {
      handleExport();
    }
    const data: Record<string, unknown> = {};
    storageKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `website-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Backup heruntergeladen!' });
  };

  const handleImport = () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Bitte füge zuerst Daten ein.' });
      return;
    }

    try {
      const data = JSON.parse(importData);
      let importedCount = 0;
      
      Object.keys(data).forEach(key => {
        if (storageKeys.includes(key)) {
          localStorage.setItem(key, JSON.stringify(data[key]));
          importedCount++;
        }
      });

      window.dispatchEvent(new Event('website_data_updated'));
      setMessage({ type: 'success', text: `${importedCount} Bereiche erfolgreich importiert!` });
      setImportData('');
    } catch (e) {
      setMessage({ type: 'error', text: 'Ungültiges JSON-Format. Bitte überprüfe die Daten.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    if (confirm('Möchtest du wirklich ALLE Website-Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      storageKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      window.dispatchEvent(new Event('website_data_updated'));
      setMessage({ type: 'success', text: 'Alle Daten wurden zurückgesetzt!' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Import / Export</h3>
          <p className="text-slate-400 text-sm mt-1">Website-Daten sichern und wiederherstellen</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <i className={`${message.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} text-xl`}></i>
          <span className="text-sm">{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-current hover:opacity-70 cursor-pointer"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
      )}

      {/* Export */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-download-line text-[#C9A961]"></i> Daten exportieren
        </h4>
        <p className="text-slate-400 text-sm">
          Exportiere alle Website-Einstellungen als JSON-Datei. Du kannst diese später wieder importieren.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-code-line"></i> Als JSON anzeigen
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-download-2-line"></i> Als Datei herunterladen
          </button>
        </div>
        {exportData && (
          <div className="mt-4">
            <label className="text-slate-400 text-xs mb-1 block">Exportierte Daten:</label>
            <textarea
              value={exportData}
              readOnly
              rows={10}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-xs font-mono focus:outline-none resize-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(exportData);
                setMessage({ type: 'success', text: 'In Zwischenablage kopiert!' });
              }}
              className="mt-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <i className="ri-file-copy-line"></i> Kopieren
            </button>
          </div>
        )}
      </div>

      {/* Import */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-upload-line text-[#C9A961]"></i> Daten importieren
        </h4>
        <p className="text-slate-400 text-sm">
          Importiere zuvor exportierte Website-Einstellungen. Bestehende Daten werden überschrieben.
        </p>
        
        <div className="flex gap-3">
          <label className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2">
            <i className="ri-file-upload-line"></i> Datei auswählen
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="text-slate-400 text-xs mb-1 block">Oder JSON direkt einfügen:</label>
          <textarea
            value={importData}
            onChange={e => setImportData(e.target.value)}
            rows={10}
            placeholder='{"website_hero": {...}, "website_pricing": {...}}'
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-[#C9A961] resize-none"
          />
        </div>

        <button
          onClick={handleImport}
          disabled={!importData.trim()}
          className="px-4 py-2 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="ri-upload-2-line"></i> Importieren
        </button>
      </div>

      {/* Reset */}
      <div className="bg-red-500/5 rounded-xl border border-red-500/20 p-6 space-y-4">
        <h4 className="text-red-400 font-semibold flex items-center gap-2">
          <i className="ri-error-warning-line"></i> Gefahrenzone
        </h4>
        <p className="text-slate-400 text-sm">
          Setze alle Website-Einstellungen auf die Standardwerte zurück. Diese Aktion kann nicht rückgängig gemacht werden.
        </p>
        <button
          onClick={handleResetAll}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
        >
          <i className="ri-delete-bin-line"></i> Alle Daten zurücksetzen
        </button>
      </div>

      {/* Info */}
      <div className="bg-slate-800/30 rounded-xl border border-dashed border-slate-600 p-4">
        <h5 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
          <i className="ri-information-line text-[#C9A961]"></i> Enthaltene Bereiche
        </h5>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'Hero', icon: 'ri-home-line' },
            { key: 'Navigation', icon: 'ri-menu-line' },
            { key: 'Features', icon: 'ri-star-line' },
            { key: 'So funktioniert\'s', icon: 'ri-list-ordered' },
            { key: 'Testimonials', icon: 'ri-chat-quote-line' },
            { key: 'Über uns', icon: 'ri-information-line' },
            { key: 'CTA', icon: 'ri-megaphone-line' },
            { key: 'Preise', icon: 'ri-price-tag-3-line' },
            { key: 'FAQ', icon: 'ri-question-line' },
            { key: 'Footer', icon: 'ri-layout-bottom-line' },
            { key: 'Rechtliches', icon: 'ri-file-text-line' },
            { key: 'SEO', icon: 'ri-search-line' }
          ].map(item => (
            <div key={item.key} className="flex items-center gap-2 text-slate-400 text-xs">
              <i className={`${item.icon} text-[#C9A961]`}></i>
              <span>{item.key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
