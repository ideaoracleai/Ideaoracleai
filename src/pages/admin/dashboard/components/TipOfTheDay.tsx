
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminGetTips, adminSaveTips } from '../../../../supabase/database';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: 'feature' | 'productivity' | 'update' | 'tip';
  isActive: boolean;
  createdAt: string;
}

const categoryConfig = {
  feature: { label: 'New Feature', icon: 'ri-sparkle-line', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  productivity: { label: 'Productivity', icon: 'ri-rocket-line', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  update: { label: 'Update', icon: 'ri-refresh-line', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  tip: { label: 'Tip', icon: 'ri-lightbulb-line', color: 'text-purple-400', bg: 'bg-purple-500/10' }
};

const aiGeneratedTips = [
  "Use the keyboard shortcut Ctrl+Enter to analyze your ideas faster.",
  "Save your best ideas as favorites to easily find them later.",
  "The more detailed your idea description, the more precise the AI analysis.",
  "Export your analyses as PDF for presentations and meetings.",
  "Use the history feature to revisit previous ideas.",
  "Combine multiple small ideas into a bigger concept for better results.",
  "Check your credits regularly to make the most of your quota.",
  "Share your best ideas with the team via the export function.",
  "Use different categories to organize your ideas better.",
  "The AI learns from your feedback - rate analyses for better results."
];

export default function TipOfTheDay() {
  const { t } = useTranslation();
  const [tips, setTips] = useState<Tip[]>([]);
  const [newTip, setNewTip] = useState({ title: '', content: '', category: 'tip' as Tip['category'] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingTip, setEditingTip] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('admin_tips_of_day');
      if (cached) setTips(JSON.parse(cached));
    } catch { /* ignore */ }
    adminGetTips().then(data => {
      if (Array.isArray(data) && data.length > 0) setTips(data as Tip[]);
    });
  }, []);

  const saveTips = async (updatedTips: Tip[]) => {
    setTips(updatedTips);
    try {
      await adminSaveTips(updatedTips);
    } catch (err) {
      console.error('Failed to save tips:', err);
    }
  };

  const generateAITip = () => {
    setIsGenerating(true);
    
    // Simuliere KI-Generierung
    setTimeout(() => {
      const randomTip = aiGeneratedTips[Math.floor(Math.random() * aiGeneratedTips.length)];
      const categories: Tip['category'][] = ['feature', 'productivity', 'update', 'tip'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const titles = {
        feature: 'Discover New Feature',
        productivity: 'Productivity Boost',
        update: 'Important Update',
        tip: 'Tip of the Day'
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
            {t('admin.tips.title', 'Tip of the Day')}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {t('admin.tips.subtitle', 'Create and manage tips shown to all users')}
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
                  {t('admin.tips.active', 'Active')}
                </span>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{activeTip.title}</h4>
              <p className="text-slate-300">{activeTip.content}</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-right">
            {t('admin.tips.currentlyShown', 'This tip is currently shown to all users')}
          </p>
        </div>
      )}

      {/* Create New Tip */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">{t('admin.tips.createNew', 'Create New Tip')}</h4>
          <button
            onClick={generateAITip}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A961] to-amber-500 text-slate-900 rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                {t('admin.tips.generating', 'Generating...')}
              </>
            ) : (
              <>
                <i className="ri-magic-line"></i>
                {t('admin.tips.generateAI', 'Generate AI Tip')}
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.tips.titleLabel', 'Title')}</label>
              <input
                type="text"
                value={newTip.title}
                onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
                placeholder={t('admin.tips.titlePlaceholder', 'e.g. Tip of the Day')}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A961] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.tips.category', 'Category')}</label>
              <select
                value={newTip.category}
                onChange={(e) => setNewTip({ ...newTip, category: e.target.value as Tip['category'] })}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#C9A961] transition-colors cursor-pointer"
              >
                <option value="tip">💡 {t('admin.tips.categoryTip', 'Tip')}</option>
                <option value="feature">✨ {t('admin.tips.categoryFeature', 'New Feature')}</option>
                <option value="productivity">🚀 {t('admin.tips.categoryProductivity', 'Productivity')}</option>
                <option value="update">🔄 {t('admin.tips.categoryUpdate', 'Update')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.tips.content', 'Content')}</label>
            <textarea
              value={newTip.content}
              onChange={(e) => setNewTip({ ...newTip, content: e.target.value })}
              placeholder={t('admin.tips.contentPlaceholder', 'Write your tip for users here...')}
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
            {t('admin.tips.addTip', 'Add Tip')}
          </button>
        </div>
      </div>

      {/* Tips List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">{t('admin.tips.allTips', 'All Tips')} ({tips.length})</h4>
        
        {tips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-lightbulb-line text-slate-500 text-2xl"></i>
            </div>
            <p className="text-slate-400 mb-2">{t('admin.tips.noTips', 'No tips created yet')}</p>
            <p className="text-sm text-slate-500">{t('admin.tips.noTipsHint', 'Click "Generate AI Tip" to get started')}</p>
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
                      {t('admin.actions.done', 'Done')}
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
                              {t('admin.tips.active', 'Active')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2">{tip.content}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(tip.createdAt).toLocaleDateString(undefined, {
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
                        title={tip.isActive ? t('admin.actions.deactivate', 'Deactivate') : t('admin.actions.activate', 'Activate')}
                      >
                        <i className={tip.isActive ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                      </button>
                      <button
                        onClick={() => setEditingTip(tip.id)}
                        className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={t('admin.actions.edit', 'Edit')}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => deleteTip(tip.id)}
                        className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                        title={t('admin.actions.delete', 'Delete')}
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
