import { useState, useEffect } from 'react';
import { useAuth } from '../../../supabase';
import { getIdeaHistory, deleteIdeaRecord } from '../../../supabase/database';
import type { IdeaRecord } from '../../../supabase/types';

interface IdeaHistoryProps {
  fullView?: boolean;
}

function getRatingStyles(rating: string) {
  switch (rating) {
    case 'good': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: 'ri-thumb-up-fill', label: 'Gut' };
    case 'medium': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: 'ri-subtract-fill', label: 'Mittel' };
    case 'bad': return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: 'ri-thumb-down-fill', label: 'Schlecht' };
    default: return { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30', icon: 'ri-question-fill', label: 'Unbekannt' };
  }
}

export default function IdeaHistory({ fullView = false }: IdeaHistoryProps) {
  const { firebaseUser } = useAuth();
  const [ideas, setIdeas] = useState<IdeaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState<number | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<typeof ideas[0] | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load from Supabase on mount
  useEffect(() => {
    if (!firebaseUser?.id) { setIsLoading(false); return; }
    getIdeaHistory(firebaseUser.id, 100)
      .then(setIdeas)
      .catch(() => showToastMessage('Fehler beim Laden', 'error'))
      .finally(() => setIsLoading(false));
  }, [firebaseUser?.id]);

  const handleDelete = async () => {
    if (!selectedIdea?.id || !firebaseUser?.id) return;
    try {
      await deleteIdeaRecord(firebaseUser.id, selectedIdea.id);
      setIdeas(prev => prev.filter(i => i.id !== selectedIdea.id));
      showToastMessage('Analyse erfolgreich gelÃ¶scht', 'success');
    } catch {
      showToastMessage('Fehler beim LÃ¶schen', 'error');
    } finally {
      setShowDeleteModal(false);
      setSelectedIdea(null);
    }
  };

  const handleExportJSON = (idea: IdeaRecord) => {
    const blob = new Blob([JSON.stringify(idea, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    setShowDownloadMenu(null);
    showToastMessage('JSON exportiert', 'success');
  };

  const handleExportTXT = (idea: IdeaRecord) => {
    const content = `IDEEN-ANALYSE\n${'='.repeat(50)}\n\nTitel: ${idea.title}\nBewertung: ${getRatingStyles(idea.rating).label}\nDatum: ${new Date(idea.createdAt).toLocaleString('de-DE')}\nCredits: ${idea.creditsUsed}\n\n${'â”€'.repeat(50)}\nAnalyse\n${'â”€'.repeat(50)}\n\n${idea.content}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    setShowDownloadMenu(null);
    showToastMessage('TXT exportiert', 'success');
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (idea.tags ?? []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRating = filterRating === 'all' || idea.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const displayedIdeas = fullView ? filteredIdeas : filteredIdeas.slice(0, 5);

  return (
    <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
          toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-[#C9A961]/90 text-[#0F1419]'
        }`}>
          <i className={`${toast.type === 'success' ? 'ri-check-line' : toast.type === 'error' ? 'ri-error-warning-line' : 'ri-information-line'} text-lg`}></i>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-5 border-b border-[#3D3428]/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Ideen-Verlauf</h2>
            <p className="text-sm text-gray-500 mt-1">
              {fullView ? `${filteredIdeas.length} Analysen` : 'Deine letzten Analysen'}
            </p>
          </div>
          {fullView && filteredIdeas.length > 0 && (
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(filteredIdeas, null, 2)], { type: 'application/json;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `alle-ideen-${Date.now()}.json`;
                document.body.appendChild(a); a.click();
                setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
                showToastMessage(`${filteredIdeas.length} Ideen exportiert`, 'success');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line"></i>
              Alle exportieren
            </button>
          )}
        </div>

        {/* Search + Filter */}
        {fullView && (
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Suche nach Titeln oder Tags..."
                className="w-full pl-9 pr-3 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30"
              />
            </div>
            <select
              value={filterRating}
              onChange={e => setFilterRating(e.target.value)}
              className="px-3 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-white focus:outline-none focus:border-[#C9A961]/30 cursor-pointer"
            >
              <option value="all">Alle Bewertungen</option>
              <option value="good">Gut</option>
              <option value="medium">Mittel</option>
              <option value="bad">Schlecht</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="divide-y divide-[#3D3428]/20">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center gap-3 text-gray-500">
            <i className="ri-loader-4-line text-2xl animate-spin text-[#C9A961]"></i>
            <p className="text-sm">Analysen werden geladen...</p>
          </div>
        ) : displayedIdeas.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-gray-500">
            <div className="w-14 h-14 bg-[#0F1419] rounded-xl flex items-center justify-center">
              <i className="ri-lightbulb-line text-2xl text-gray-600"></i>
            </div>
            <p className="text-sm font-medium">{searchQuery || filterRating !== 'all' ? 'Keine Ergebnisse gefunden' : 'Noch keine Analysen vorhanden'}</p>
            <p className="text-xs text-gray-600">{!searchQuery && filterRating === 'all' ? 'Starte eine Analyse im KI-Assistenten' : ''}</p>
          </div>
        ) : (
          displayedIdeas.map(idea => {
            const rs = getRatingStyles(idea.rating);
            return (
              <div key={idea.id} className="p-4 hover:bg-[#0F1419]/30 transition-colors group">
                <div className="flex items-start gap-3">
                  {/* Rating badge */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${rs.bg} border ${rs.border}`}>
                    <i className={`${rs.icon} text-sm ${rs.text}`}></i>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white leading-snug truncate">{idea.title}</h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Download menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowDownloadMenu(showDownloadMenu === (displayedIdeas.indexOf(idea)) ? null : displayedIdeas.indexOf(idea))}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#1A1F26] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          >
                            <i className="ri-download-2-line text-sm"></i>
                          </button>
                          {showDownloadMenu === displayedIdeas.indexOf(idea) && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-[#1A1F26] border border-[#3D3428]/40 rounded-lg shadow-xl overflow-hidden z-20">
                              <button onClick={() => handleExportJSON(idea)} className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-[#0F1419] flex items-center gap-2 cursor-pointer">
                                <i className="ri-braces-line text-[#C9A961]"></i> JSON
                              </button>
                              <button onClick={() => handleExportTXT(idea)} className="w-full px-3 py-2 text-left text-xs text-gray-300 hover:text-white hover:bg-[#0F1419] flex items-center gap-2 cursor-pointer">
                                <i className="ri-file-text-line text-[#C9A961]"></i> TXT
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => { setSelectedIdea(idea); setShowDetailModal(true); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-[#1A1F26] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <i className="ri-expand-diagonal-line text-sm"></i>
                        </button>
                        <button
                          onClick={() => { setSelectedIdea(idea); setShowDeleteModal(true); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-sm"></i>
                        </button>
                      </div>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${rs.bg} ${rs.text}`}>{rs.label}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <i className="ri-calendar-line text-[10px]"></i>
                        {new Date(idea.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <i className="ri-coins-line text-[10px]"></i>
                        {idea.creditsUsed} Credits
                      </span>
                    </div>

                    {/* Tags */}
                    {(idea.tags ?? []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(idea.tags ?? []).map((tag, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-[#0F1419] text-gray-400 rounded-full border border-[#3D3428]/30">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Content preview */}
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {idea.content.replace(/[#*`]/g, '').substring(0, 200)}...
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedIdea && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between p-5 border-b border-[#3D3428]/30">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-lg font-bold text-white truncate">{selectedIdea.title}</h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {(() => { const rs = getRatingStyles(selectedIdea.rating); return <span className={`text-xs font-semibold px-2 py-0.5 rounded ${rs.bg} ${rs.text}`}>{rs.label}</span>; })()}
                  <span className="text-xs text-gray-500">{new Date(selectedIdea.createdAt).toLocaleString('de-DE')}</span>
                  <span className="text-xs text-gray-500">{selectedIdea.creditsUsed} Credits</span>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-[#0F1419] transition-all cursor-pointer flex-shrink-0">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {(selectedIdea.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(selectedIdea.tags ?? []).map((tag, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-[#0F1419] text-gray-400 rounded-full border border-[#3D3428]/30">{tag}</span>
                  ))}
                </div>
              )}
              <div className="prose-ai text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedIdea.content}</div>
            </div>
            <div className="p-4 border-t border-[#3D3428]/30 flex gap-2 justify-end">
              <button onClick={() => handleExportJSON(selectedIdea)} className="px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer flex items-center gap-1.5">
                <i className="ri-braces-line"></i> JSON
              </button>
              <button onClick={() => handleExportTXT(selectedIdea)} className="px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer flex items-center gap-1.5">
                <i className="ri-file-text-line"></i> TXT
              </button>
              <button onClick={() => { setShowDetailModal(false); setSelectedIdea(selectedIdea); setShowDeleteModal(true); }} className="px-3 py-2 text-xs text-red-400 hover:text-white hover:bg-red-500/10 rounded-lg transition-all cursor-pointer flex items-center gap-1.5">
                <i className="ri-delete-bin-line"></i> LÃ¶schen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedIdea && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line text-red-400 text-xl"></i>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Analyse lÃ¶schen?</h3>
                <p className="text-sm text-gray-400">â€ž{selectedIdea.title}" wird dauerhaft gelÃ¶scht.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setSelectedIdea(null); }} className="flex-1 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer whitespace-nowrap">
                Abbrechen
              </button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2">
                <i className="ri-delete-bin-line"></i> LÃ¶schen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close download menu */}
      {showDownloadMenu !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(null)}></div>
      )}
    </div>
  );
}
