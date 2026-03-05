
import { useState, useEffect } from 'react';

interface CustomCode {
  css: string;
  js: string;
  headHtml: string;
  bodyHtml: string;
}

export default function CustomCodeEditor() {
  const [code, setCode] = useState<CustomCode>({
    css: '',
    js: '',
    headHtml: '',
    bodyHtml: '',
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'css' | 'js' | 'head' | 'body'>('css');

  /* -------------------------------------------------
   * Load previously saved custom code from localStorage
   * ------------------------------------------------- */
  useEffect(() => {
    try {
      const stored = localStorage.getItem('websiteCustomCode');
      if (stored) {
        setCode(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to parse stored custom code:', err);
    }
  }, []);

  /* -------------------------------------------------
   * Save current custom code to localStorage and notify
   * ------------------------------------------------- */
  const handleSave = () => {
    try {
      localStorage.setItem('websiteCustomCode', JSON.stringify(code));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Notify other parts of the app that the code changed
      window.dispatchEvent(new CustomEvent('websiteCustomCodeUpdated', { detail: code }));
    } catch (err) {
      console.error('Unable to save custom code:', err);
    }
  };

  /* -------------------------------------------------
   * Reset all custom code fields after user confirmation
   * ------------------------------------------------- */
  const handleReset = () => {
    if (confirm('Alle benutzerdefinierten Codes löschen?')) {
      setCode({ css: '', js: '', headHtml: '', bodyHtml: '' });
    }
  };

  const tabs = [
    { id: 'css' as const, label: 'Custom CSS', icon: 'ri-css3-line', color: 'text-blue-400' },
    { id: 'js' as const, label: 'Custom JavaScript', icon: 'ri-javascript-line', color: 'text-yellow-400' },
    { id: 'head' as const, label: 'Head HTML', icon: 'ri-code-line', color: 'text-green-400' },
    { id: 'body' as const, label: 'Body HTML', icon: 'ri-code-s-slash-line', color: 'text-purple-400' },
  ];

  const examples = {
    css: `/* Beispiel: Eigene Styles hinzufügen */
.custom-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 12px 24px;
}

/* Globale Anpassungen */
body {
  font-size: 16px;
}`,
    js: `// Beispiel: Eigene Funktionen hinzufügen
console.log('Custom JavaScript geladen');

// Event Listener
document.addEventListener('DOMContentLoaded', function() {
  console.log('Seite vollständig geladen');
});`,
    head: `<!-- Beispiel: Meta-Tags, Fonts, Analytics -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<meta name="custom-meta" content="value">`,
    body: `<!-- Beispiel: Tracking-Codes, Widgets -->
<!-- Google Analytics, Facebook Pixel, etc. -->`,
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Benutzerdefinierter Code</h3>
        <p className="text-slate-400 text-sm">
          Füge eigenes CSS, JavaScript oder HTML hinzu
        </p>
      </div>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <i className="ri-alert-line text-yellow-400 text-xl"></i>
          <div className="flex-1">
            <p className="text-yellow-300 font-medium mb-1">⚠️ Vorsicht</p>
            <p className="text-yellow-200 text-sm">
              Fehlerhafter Code kann die Website beschädigen. Teste Änderungen sorgfältig.
              Bei Problemen kannst du den Code hier zurücksetzen.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-[#C9A961] text-[#C9A961]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className={`${tab.icon} ${tab.color}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CSS Editor */}
      {activeTab === 'css' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Custom CSS
            </label>
            <textarea
              value={code.css}
              onChange={(e) => setCode({ ...code, css: e.target.value })}
              placeholder={examples.css}
              rows={15}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-mono resize-none"
            />
            <p className="text-slate-500 text-xs mt-2">
              Wird in einem <code>&lt;style&gt;</code>-Tag im <code>&lt;head&gt;</code> eingefügt
            </p>
          </div>
        </div>
      )}

      {/* JS Editor */}
      {activeTab === 'js' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Custom JavaScript
            </label>
            <textarea
              value={code.js}
              onChange={(e) => setCode({ ...code, js: e.target.value })}
              placeholder={examples.js}
              rows={15}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-mono resize-none"
            />
            <p className="text-slate-500 text-xs mt-2">
              Wird in einem <code>&lt;script&gt;</code>-Tag am Ende des <code>&lt;body&gt;</code> eingefügt
            </p>
          </div>
        </div>
      )}

      {/* Head HTML Editor */}
      {activeTab === 'head' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Head HTML
            </label>
            <textarea
              value={code.headHtml}
              onChange={(e) => setCode({ ...code, headHtml: e.target.value })}
              placeholder={examples.head}
              rows={15}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-mono resize-none"
            />
            <p className="text-slate-500 text-xs mt-2">
              Wird im <code>&lt;head&gt;</code>-Bereich eingefügt (z.B. Meta‑Tags, Fonts, Analytics)
            </p>
          </div>
        </div>
      )}

      {/* Body HTML Editor */}
      {activeTab === 'body' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Body HTML
            </label>
            <textarea
              value={code.bodyHtml}
              onChange={(e) => setCode({ ...code, bodyHtml: e.target.value })}
              placeholder={examples.body}
              rows={15}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-mono resize-none"
            />
            <p className="text-slate-500 text-xs mt-2">
              Wird am Ende des <code>&lt;body&gt;</code>-Bereichs eingefügt (z.B. Tracking‑Codes, Widgets)
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">CSS Zeilen</p>
          <p className="text-2xl font-bold text-blue-400">{code.css.split('\n').length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">JS Zeilen</p>
          <p className="text-2xl font-bold text-yellow-400">{code.js.split('\n').length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Head Zeilen</p>
          <p className="text-2xl font-bold text-green-400">{code.headHtml.split('\n').length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Body Zeilen</p>
          <p className="text-2xl font-bold text-purple-400">{code.bodyHtml.split('\n').length}</p>
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
          className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap"
        >
          Alles löschen
        </button>
      </div>
    </div>
  );
}
