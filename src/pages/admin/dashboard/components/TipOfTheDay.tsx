
import { useState, useEffect } from 'react';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: 'feature' | 'productivity' | 'update' | 'tip';
  isActive: boolean;
  createdAt: string;
}

const categoryConfig = {
  feature: { label: 'Neue Funktion', icon: 'ri-sparkle-line', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  productivity: { label: 'Produktivität', icon: 'ri-rocket-line', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  update: { label: 'Update', icon: 'ri-refresh-line', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  tip: { label: 'Tipp', icon: 'ri-lightbulb-line', color: 'text-purple-400', bg: 'bg-purple-500/10' }
};

const aiGeneratedTips = [
  "Nutze die Tastenkombination Strg+Enter, um deine Ideen schneller zu analysieren.",
  "Speichere deine besten Ideen als Favoriten, um sie später leicht wiederzufinden.",
  "Je detaillierter deine Ideenbeschreibung, desto präziser die KI-Analyse.",
  "Exportiere deine Analysen als PDF für Präsentationen und Meetings.",
  "Nutze die Verlaufsfunktion, um frühere Ideen erneut zu betrachten.",
  "Kombiniere mehrere kleine Ideen zu einem größeren Konzept für bessere Ergebnisse.",
  "Überprüfe regelmäßig deine Credits, um dein Kontingent optimal zu nutzen.",
  "Teile deine besten Ideen mit dem Team über die Export-Funktion.",
  "Nutze verschiedene Kategorien, um deine Ideen besser zu organisieren.",
  "Die KI lernt aus deinem Feedback - bewerte Analysen für bessere Ergebnisse."
];

export default function TipOfTheDay() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [newTip, setNewTip] = useState({ title: '', content: '', category: 'tip' as Tip['category'] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTip, setEditingTip] = useState<string | null>(null);

  useEffect(() => {
    const savedTips = localStorage.getItem('admin_tips_of_day');
    if (savedTips) {
      setTips(JSON.parse(savedTips));
    }
  }, []);

  const saveTips = (updatedTips: Tip[]) => {
    setTips(updatedTips);
    localStorage.setItem('admin_tips_of_day', JSON.stringify(updatedTips));
  };

  const generateAITip = () => {
    setIsGenerating(true);
    
    // Simuliere KI-Generierung
    setTimeout(() => {
      const randomTip = aiGeneratedTips[Math.floor(Math.random() * aiGeneratedTips.length)];
      const categories: Tip['category'][] = ['feature', 'productivity', 'update', 'tip'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const titles = {
        feature: 'Neue Funktion entdecken',
        productivity: 'Produktivitäts-Boost',
        update: 'Wichtiges Update',
        tip: 'Tipp des Tages'
      };

      setNewTip({
        title: titles[randomCategory],
        content: randomTip,
        category: randomCategory
      });
      setIsGenerating(false);
    }, 1500);
  };

  const addTip = () => {
    if (!newTip.title.trim() || !newTip.content.trim()) return;

    const tip: Tip = {
      id: Date.now().toString(),
      title: newTip.title,
      content: newTip.content,
      category: newTip.category,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    saveTips([tip, ...tips]);
    setNewTip({ title: '', content: '', category: 'tip' });
  };

  const toggleTipActive = (id: string) => {
    const updatedTips = tips.map(tip =>
      tip.id === id ? { ...tip, isActive: !tip.isActive } : tip
    );
    saveTips(updatedTips);
  };

  const deleteTip = (id: string) => {
    saveTips(tips.filter(tip => tip.id !== id));
  };

  const updateTip = (id: string, updates: Partial<Tip>) => {
    const updatedTips = tips.map(tip =>
      tip.id === id ? { ...tip, ...updates } : tip
    );
    saveTips(updatedTips);
    setEditingTip(null);
  };

  const activeTip = tips.find(tip => tip.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="ri-lightbulb-flash-line text-[#C9A961]"></i>
            Tipp des Tages
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Erstelle und verwalte Tipps, die allen Benutzern angezeigt werden
          </p>
        </div>
      </div>

      {/* Current Active Tip Preview */}
      {activeTip && (
        <div className="bg-gradient-to-r from-[#C9A961]/20 to-amber-500/10 border border-[#C9A961]/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 ${categoryConfig[activeTip.category].bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <i className={`${categoryConfig[activeTip.category].icon} ${categoryConfig[activeTip.category].color} text-xl`}></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryConfig[activeTip.category].bg} ${categoryConfig[activeTip.category].color}`}>
                  {categoryConfig[activeTip.category].label}
                </span>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <i className="ri-checkbox-circle-fill"></i>
                  Aktiv
                </span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{activeTip.title}</h4>
              <p className="text-slate-300">{activeTip.content}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-right">
            Dieser Tipp wird aktuell allen Benutzern angezeigt
          </p>
        </div>
      )}

      {/* Create New Tip */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Neuen Tipp erstellen</h4>
          <button
            onClick={generateAITip}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A961] to-amber-500 text-slate-900 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Generiere...
              </>
            ) : (
              <>
                <i className="ri-magic-line"></i>
                KI-Tipp generieren
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Titel</label>
              <input
                type="text"
                value={newTip.title}
                onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
                placeholder="z.B. Tipp des Tages"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A961] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Kategorie</label>
              <select
                value={newTip.category}
                onChange={(e) => setNewTip({ ...newTip, category: e.target.value as Tip['category'] })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#C9A961] transition-colors cursor-pointer"
              >
                <option value="tip">💡 Tipp</option>
                <option value="feature">✨ Neue Funktion</option>
                <option value="productivity">🚀 Produktivität</option>
                <option value="update">🔄 Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Inhalt</label>
            <textarea
              value={newTip.content}
              onChange={(e) => setNewTip({ ...newTip, content: e.target.value })}
              placeholder="Schreibe hier deinen Tipp für die Benutzer..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A961] transition-colors resize-none"
            />
            <p className="text-xs text-slate-500 mt-1 text-right">{newTip.content.length}/500</p>
          </div>

          <button
            onClick={addTip}
            disabled={!newTip.title.trim() || !newTip.content.trim()}
            className="w-full py-3 bg-[#C9A961] text-slate-900 rounded-lg font-semibold hover:bg-[#d4b872] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Tipp hinzufügen
          </button>
        </div>
      </div>

      {/* Tips List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Alle Tipps ({tips.length})</h4>
        
        {tips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-lightbulb-line text-slate-500 text-2xl"></i>
            </div>
            <p className="text-slate-400 mb-2">Noch keine Tipps erstellt</p>
            <p className="text-sm text-slate-500">Klicke auf "KI-Tipp generieren" um zu starten</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tips.map((tip) => (
              <div
                key={tip.id}
                className={`p-4 rounded-lg border transition-all ${
                  tip.isActive
                    ? 'bg-[#C9A961]/10 border-[#C9A961]/30'
                    : 'bg-slate-900/50 border-slate-700'
                }`}
              >
                {editingTip === tip.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      defaultValue={tip.title}
                      onBlur={(e) => updateTip(tip.id, { title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                    <textarea
                      defaultValue={tip.content}
                      onBlur={(e) => updateTip(tip.id, { content: e.target.value })}
                      rows={2}
                      maxLength={500}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
                    />
                    <button
                      onClick={() => setEditingTip(null)}
                      className="text-sm text-[#C9A961] hover:underline cursor-pointer"
                    >
                      Fertig
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 ${categoryConfig[tip.category].bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <i className={`${categoryConfig[tip.category].icon} ${categoryConfig[tip.category].color}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-medium text-white truncate">{tip.title}</h5>
                          {tip.isActive && (
                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full whitespace-nowrap">
                              Aktiv
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{tip.content}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(tip.createdAt).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleTipActive(tip.id)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          tip.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                        title={tip.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        <i className={tip.isActive ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                      </button>
                      <button
                        onClick={() => setEditingTip(tip.id)}
                        className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Bearbeiten"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => deleteTip(tip.id)}
                        className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                        title="Löschen"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
