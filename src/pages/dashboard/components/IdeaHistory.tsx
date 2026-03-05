import { useState } from 'react';
import { ideaHistory } from '../../../mocks/dashboardData';
import type { IdeaAnalysis } from '../../../mocks/dashboardData';

interface IdeaHistoryProps {
  fullView?: boolean;
}

export default function IdeaHistory({ fullView = false }: IdeaHistoryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [ideas, setIdeas] = useState(ideaHistory);
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

  const getRatingStyles = (rating: string) => {
    switch (rating) {
      case 'gut':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          icon: 'ri-thumb-up-fill',
          label: 'Gut'
        };
      case 'mittel':
        return {
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          icon: 'ri-subtract-fill',
          label: 'Mittel'
        };
      case 'schlecht':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/30',
          icon: 'ri-thumb-down-fill',
          label: 'Schlecht'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          border: 'border-gray-500/30',
          icon: 'ri-question-fill',
          label: 'Unbekannt'
        };
    }
  };

  const formatIdeaAsText = (idea: IdeaAnalysis): string => {
    const ratingLabel = getRatingStyles(idea.rating).label;
    return `
═══════════════════════════════════════════════════════════════════════════
                           IDEEN-ANALYSE EXPORT
═══════════════════════════════════════════════════════════════════════════

📌 TITEL
${idea.title}

📊 BEWERTUNG
${ratingLabel}

📅 DATUM
${new Date(idea.timestamp).toLocaleString('de-DE')}

🏷️ KATEGORIE
${idea.category}

👥 ZIELGRUPPE
${idea.targetAudience}

───────────────────────────────────────────────────────────────────────────
📈 MARKTANALYSE
───────────────────────────────────────────────────────────────────────────

Marktgröße: ${idea.marketSize}/10
Wettbewerb: ${idea.competition}/10
Startkapital: ${idea.startupCost}/10
Zeit bis Markteinführung: ${idea.timeToMarket}/10
Gewinnpotenzial: ${idea.profitPotential}/10
Skalierbarkeit: ${idea.scalability}/10

───────────────────────────────────────────────────────────────────────────
📝 ZUSAMMENFASSUNG
───────────────────────────────────────────────────────────────────────────

${idea.analysis.marketAnalysis}

───────────────────────────────────────────────────────────────────────────
💪 STÄRKEN
───────────────────────────────────────────────────────────────────────────

${idea.analysis.swot.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

───────────────────────────────────────────────────────────────────────────
⚠️ SCHWÄCHEN
───────────────────────────────────────────────────────────────────────────

${idea.analysis.swot.weaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

───────────────────────────────────────────────────────────────────────────
🚀 CHANCEN
───────────────────────────────────────────────────────────────────────────

${idea.analysis.swot.opportunities.map((o, i) => `${i + 1}. ${o}`).join('\n')}

───────────────────────────────────────────────────────────────────────────
⚡ RISIKEN
───────────────────────────────────────────────────────────────────────────

${idea.analysis.swot.threats.map((t, i) => `${i + 1}. ${t}`).join('\n')}

───────────────────────────────────────────────────────────────────────────
💡 EMPFEHLUNGEN
───────────────────────────────────────────────────────────────────────────

${idea.analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

═══════════════════════════════════════════════════════════════════════════
Exportiert am: ${new Date().toLocaleString('de-DE', { 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit', 
  hour: '2-digit', 
  minute: '2-digit' 
})}
═══════════════════════════════════════════════════════════════════════════
`.trim();
  };

  const openDeleteModal = (idea: typeof ideas[0]) => {
    setSelectedIdea(idea);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (selectedIdea) {
      setIdeas(ideas.filter(idea => idea.id !== selectedIdea.id));
      setExpandedId(null);
      setShowDeleteModal(false);
      setSelectedIdea(null);
      showToastMessage('Analyse erfolgreich gelöscht', 'success');
    }
  };

  const openDetailModal = (idea: typeof ideas[0]) => {
    setSelectedIdea(idea);
    setShowDetailModal(true);
  };

  const handleExportJSON = (idea: IdeaAnalysis) => {
    try {
      const exportData = {
        title: idea.title,
        rating: idea.rating,
        timestamp: idea.timestamp,
        creditsUsed: idea.creditsUsed,
        category: idea.category,
        targetAudience: idea.targetAudience,
        marketSize: idea.marketSize,
        competition: idea.competition,
        startupCost: idea.startupCost,
        timeToMarket: idea.timeToMarket,
        profitPotential: idea.profitPotential,
        scalability: idea.scalability,
        analysis: idea.analysis,
        exportedAt: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${idea.title.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '-')}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      setShowDownloadMenu(null);
      showToastMessage('JSON-Datei erfolgreich heruntergeladen', 'success');
    } catch (error) {
      console.error('Export-Fehler:', error);
      showToastMessage('Fehler beim Exportieren', 'error');
    }
  };

  const handleExportTXT = (idea: IdeaAnalysis) => {
    try {
      const content = formatIdeaAsText(idea);
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${idea.title.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '-')}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      setShowDownloadMenu(null);
      showToastMessage('TXT-Datei erfolgreich heruntergeladen', 'success');
    } catch (error) {
      console.error('Export-Fehler:', error);
      showToastMessage('Fehler beim Exportieren', 'error');
    }
  };

  const handleExportPDF = async (idea: IdeaAnalysis) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPos = margin;

      const addText = (text: string, fontSize: number, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin, yPos);
          yPos += fontSize * 0.5;
        });
        
        yPos += 5;
      };

      addText(`Geschäftsideen-Analyse: ${idea.title}`, 18, true);
      yPos += 5;

      addText(`Datum: ${new Date(idea.timestamp).toLocaleString('de-DE')}`, 10);
      addText(`Kategorie: ${idea.category}`, 10);
      addText(`Zielgruppe: ${idea.targetAudience}`, 10);
      yPos += 5;

      addText('Kennzahlen:', 14, true);
      const metrics = [
        `Marktgröße: ${idea.marketSize}/10`,
        `Wettbewerb: ${idea.competition}/10`,
        `Startkapital: ${idea.startupCost}/10`,
        `Zeit bis Markt: ${idea.timeToMarket}/10`,
        `Gewinnpotenzial: ${idea.profitPotential}/10`,
        `Skalierbarkeit: ${idea.scalability}/10`
      ];
      metrics.forEach(metric => addText(metric, 10));
      yPos += 5;

      addText('Marktanalyse:', 14, true);
      addText(idea.analysis.marketAnalysis, 10);
      yPos += 5;

      addText('SWOT-Analyse:', 14, true);
      
      addText('Stärken:', 12, true);
      idea.analysis.swot.strengths.forEach(item => addText(`• ${item}`, 10));
      yPos += 3;

      addText('Schwächen:', 12, true);
      idea.analysis.swot.weaknesses.forEach(item => addText(`• ${item}`, 10));
      yPos += 3;

      addText('Chancen:', 12, true);
      idea.analysis.swot.opportunities.forEach(item => addText(`• ${item}`, 10));
      yPos += 3;

      addText('Risiken:', 12, true);
      idea.analysis.swot.threats.forEach(item => addText(`• ${item}`, 10));
      yPos += 5;

      addText('Handlungsempfehlungen:', 14, true);
      idea.analysis.recommendations.forEach((rec, index) => {
        addText(`${index + 1}. ${rec}`, 10);
      });

      const filename = `${idea.title.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '-')}-${Date.now()}.pdf`;
      doc.save(filename);
      
      setShowDownloadMenu(null);
      showToastMessage('PDF-Datei erfolgreich heruntergeladen', 'success');
    } catch (error) {
      console.error('Export-Fehler:', error);
      showToastMessage('Fehler beim Exportieren', 'error');
    }
  };

  const handleExportAllJSON = () => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalIdeas: filteredIdeas.length,
        ideas: filteredIdeas.map(idea => ({
          title: idea.title,
          rating: idea.rating,
          timestamp: idea.timestamp,
          creditsUsed: idea.creditsUsed,
          category: idea.category,
          targetAudience: idea.targetAudience,
          marketSize: idea.marketSize,
          competition: idea.competition,
          startupCost: idea.startupCost,
          timeToMarket: idea.timeToMarket,
          profitPotential: idea.profitPotential,
          scalability: idea.scalability,
          analysis: idea.analysis
        }))
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-ideas-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      showToastMessage(`${filteredIdeas.length} Ideen erfolgreich als JSON exportiert`, 'success');
    } catch (error) {
      console.error('Export-Fehler:', error);
      showToastMessage('Fehler beim Exportieren', 'error');
    }
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         idea.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating = filterRating === 'all' || idea.rating === filterRating;
    return matchesSearch && matchesRating;
  });

  const displayedIdeas = fullView ? filteredIdeas : filteredIdeas.slice(0, 5);

  return (
    <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease] ${
          toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
          toast.type === 'error' ? 'bg-red-500/90 text-white' :
          'bg-[#C9A961]/90 text-[#0F1419]'
        }`}>
          <i className={`${
            toast.type === 'success' ? 'ri-check-line' :
            toast.type === 'error' ? 'ri-error-warning-line' :
            'ri-information-line'
          } text-lg`}></i>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

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
              onClick={handleExportAllJSON}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-2-line"></i>
              Alle exportieren
            </button>
          )}
        </div>

        {fullView && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="Ideen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30"
              />
            </div>
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-4 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-white focus:outline-none focus:border-[#C9A961]/30 cursor-pointer"
            >
              <option value="all">Alle Bewertungen</option>
              <option value="gut">Gut</option>
              <option value="mittel">Mittel</option>
              <option value="schlecht">Schlecht</option>
            </select>
          </div>
        )}
      </div>

      <div className="divide-y divide-[#3D3428]/30">
        {displayedIdeas.length === 0 ? (
          <div className="p-8 text-center">
            <i className="ri-inbox-line text-4xl text-gray-600 mb-3"></i>
            <p className="text-gray-400">Keine Analysen gefunden</p>
          </div>
        ) : (
          displayedIdeas.map((idea) => {
            const ratingStyle = getRatingStyles(idea.rating);
            const isExpanded = expandedId === idea.id;

            return (
              <div
                key={idea.id}
                className="p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div 
                  className="flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-white font-medium">{idea.title}</h3>
                      <span className={`
                        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${ratingStyle.bg} ${ratingStyle.text} border ${ratingStyle.border}
                      `}>
                        <i className={ratingStyle.icon}></i>
                        {ratingStyle.label}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/30">
                        <i className="ri-price-tag-3-line"></i>
                        {idea.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <i className="ri-calendar-line"></i>
                        {new Date(idea.timestamp).toLocaleDateString('de-DE')}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-coins-line"></i>
                        {idea.creditsUsed} Credits
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-group-line"></i>
                        {idea.targetAudience}
                      </span>
                    </div>
                  </div>
                  <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                    <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-lg transition-transform`}></i>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#3D3428]/30 space-y-4">
                    {/* Marktanalyse Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-bar-chart-line text-[#C9A961]"></i>
                          <span className="text-xs text-gray-500">Marktgröße</span>
                        </div>
                        <p className="text-sm text-white font-medium">{idea.marketSize}/10</p>
                      </div>
                      <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-sword-line text-[#C9A961]"></i>
                          <span className="text-xs text-gray-500">Wettbewerb</span>
                        </div>
                        <p className="text-sm text-white font-medium">{idea.competition}/10</p>
                      </div>
                      <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-money-euro-circle-line text-[#C9A961]"></i>
                          <span className="text-xs text-gray-500">Startkapital</span>
                        </div>
                        <p className="text-sm text-white font-medium">{idea.startupCost}/10</p>
                      </div>
                      <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-time-line text-[#C9A961]"></i>
                          <span className="text-xs text-gray-500">Zeit bis Markt</span>
                        </div>
                        <p className="text-sm text-white font-medium">{idea.timeToMarket}/10</p>
                      </div>
                      <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-line-chart-line text-[#C9A961]"></i>
                          <span className="text-xs text-gray-500">Gewinnpotenzial</span>
                        </div>
                        <p className="text-sm text-white font-medium">{idea.profitPotential}/10</p>
                      </div>
                      <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <i className="ri-rocket-line text-[#C9A961]"></i>
                          <span className="text-xs text-gray-500">Skalierbarkeit</span>
                        </div>
                        <p className="text-sm text-white font-medium">{idea.scalability}/10</p>
                      </div>
                    </div>

                    {/* Zusammenfassung */}
                    <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-[#C9A961] mb-2 flex items-center gap-2">
                        <i className="ri-file-text-line"></i>
                        Zusammenfassung
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed">{idea.analysis.marketAnalysis}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Details Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDetailModal(idea); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-lg text-sm text-[#C9A961] font-medium hover:bg-[#C9A961]/20 hover:border-[#C9A961]/50 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-eye-line"></i>
                        Vollständige Analyse
                      </button>
                      
                      {/* Download Dropdown */}
                      <div className="relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowDownloadMenu(showDownloadMenu === idea.id ? null : idea.id); }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-white font-medium hover:border-[#C9A961]/30 hover:text-[#C9A961] transition-all cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-download-line"></i>
                          Herunterladen
                          <i className={`ri-arrow-${showDownloadMenu === idea.id ? 'up' : 'down'}-s-line text-xs`}></i>
                        </button>
                        
                        {showDownloadMenu === idea.id && (
                          <div className="absolute top-full left-0 mt-2 w-48 bg-[#1A1F26] border border-[#3D3428]/50 rounded-lg shadow-xl z-20 overflow-hidden">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleExportJSON(idea); }}
                              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#C9A961]/10 hover:text-[#C9A961] transition-colors cursor-pointer flex items-center gap-3"
                            >
                              <i className="ri-braces-line"></i>
                              Als JSON speichern
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleExportTXT(idea); }}
                              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#C9A961]/10 hover:text-[#C9A961] transition-colors cursor-pointer flex items-center gap-3 border-t border-[#3D3428]/30"
                            >
                              <i className="ri-file-text-line"></i>
                              Als TXT speichern
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleExportPDF(idea); }}
                              className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#C9A961]/10 hover:text-[#C9A961] transition-colors cursor-pointer flex items-center gap-3 border-t border-[#3D3428]/30"
                            >
                              <i className="ri-file-pdf-line"></i>
                              Als PDF speichern
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Delete Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); openDeleteModal(idea); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#0F1419] border border-red-500/30 rounded-lg text-sm text-red-400 font-medium hover:bg-red-500/10 hover:border-red-500/50 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line"></i>
                        Löschen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedIdea && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-[#3D3428]/30 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h2 className="text-xl font-bold text-white">{selectedIdea.title}</h2>
                    <span className={`
                      inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                      ${getRatingStyles(selectedIdea.rating).bg} ${getRatingStyles(selectedIdea.rating).text} border ${getRatingStyles(selectedIdea.rating).border}
                    `}>
                      <i className={getRatingStyles(selectedIdea.rating).icon}></i>
                      {getRatingStyles(selectedIdea.rating).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <i className="ri-calendar-line"></i>
                      {new Date(selectedIdea.timestamp).toLocaleDateString('de-DE')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="ri-coins-line"></i>
                      {selectedIdea.creditsUsed} Credits
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="ri-price-tag-3-line"></i>
                      {selectedIdea.category}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Marktanalyse */}
                <div>
                  <h3 className="text-sm font-semibold text-[#C9A961] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="ri-bar-chart-box-line"></i>
                    Marktanalyse
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-group-line text-[#C9A961] text-sm"></i>
                        <span className="text-xs text-gray-500">Zielgruppe</span>
                      </div>
                      <p className="text-sm text-white font-medium">{selectedIdea.targetAudience}</p>
                    </div>
                    <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-bar-chart-line text-[#C9A961] text-sm"></i>
                        <span className="text-xs text-gray-500">Marktgröße</span>
                      </div>
                      <p className="text-sm text-white font-medium">{selectedIdea.marketSize}/10</p>
                    </div>
                    <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-sword-line text-[#C9A961] text-sm"></i>
                        <span className="text-xs text-gray-500">Wettbewerb</span>
                      </div>
                      <p className="text-sm text-white font-medium">{selectedIdea.competition}/10</p>
                    </div>
                    <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-money-euro-circle-line text-[#C9A961] text-sm"></i>
                        <span className="text-xs text-gray-500">Startkapital</span>
                      </div>
                      <p className="text-sm text-white font-medium">{selectedIdea.startupCost}/10</p>
                    </div>
                    <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-time-line text-[#C9A961] text-sm"></i>
                        <span className="text-xs text-gray-500">Zeit bis Markt</span>
                      </div>
                      <p className="text-sm text-white font-medium">{selectedIdea.timeToMarket}/10</p>
                    </div>
                    <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-line-chart-line text-[#C9A961] text-sm"></i>
                        <span className="text-xs text-gray-500">Gewinnpotenzial</span>
                      </div>
                      <p className="text-sm text-white font-medium">{selectedIdea.profitPotential}/10</p>
                    </div>
                    <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-3 md:col-span-3">
                      <div className="flex items-center gap-2 mb-1">
                        <i className="ri-rocket-line text-[#C9A961] text-sm"></i>
                        <span className="text-xs text-gray-500">Skalierbarkeit</span>
                      </div>
                      <p className="text-sm text-white font-medium">{selectedIdea.scalability}/10</p>
                    </div>
                  </div>
                </div>

                {/* Zusammenfassung */}
                <div>
                  <h3 className="text-sm font-semibold text-[#C9A961] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="ri-file-text-line"></i>
                    Zusammenfassung
                  </h3>
                  <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-4">
                    <p className="text-gray-300 leading-relaxed">{selectedIdea.analysis.marketAnalysis}</p>
                  </div>
                </div>

                {/* SWOT Analyse */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Stärken */}
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <i className="ri-thumb-up-line"></i>
                      Stärken
                    </h3>
                    <div className="bg-[#0F1419] border border-emerald-500/20 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedIdea.analysis.swot.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                            <i className="ri-checkbox-circle-fill text-emerald-400 mt-0.5 flex-shrink-0"></i>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Schwächen */}
                  <div>
                    <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <i className="ri-thumb-down-line"></i>
                      Schwächen
                    </h3>
                    <div className="bg-[#0F1419] border border-red-500/20 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedIdea.analysis.swot.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                            <i className="ri-close-circle-fill text-red-400 mt-0.5 flex-shrink-0"></i>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Chancen */}
                  <div>
                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <i className="ri-lightbulb-line"></i>
                      Chancen
                    </h3>
                    <div className="bg-[#0F1419] border border-blue-500/20 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedIdea.analysis.swot.opportunities.map((opportunity, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                            <i className="ri-arrow-right-up-line text-blue-400 mt-0.5 flex-shrink-0"></i>
                            <span>{opportunity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Risiken */}
                  <div>
                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <i className="ri-alert-line"></i>
                      Risiken
                    </h3>
                    <div className="bg-[#0F1419] border border-amber-500/20 rounded-lg p-4">
                      <ul className="space-y-2">
                        {selectedIdea.analysis.swot.threats.map((threat, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                            <i className="ri-error-warning-fill text-amber-400 mt-0.5 flex-shrink-0"></i>
                            <span>{threat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Empfehlungen */}
                <div>
                  <h3 className="text-sm font-semibold text-[#C9A961] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="ri-lightbulb-flash-line"></i>
                    Empfehlungen
                  </h3>
                  <div className="bg-[#0F1419] border border-[#C9A961]/30 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedIdea.analysis.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <i className="ri-star-fill text-[#C9A961] mt-0.5 flex-shrink-0"></i>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-[#3D3428]/30 bg-[#0F1419]/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { handleExportJSON(selectedIdea); setShowDetailModal(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-sm text-white font-medium hover:border-[#C9A961]/30 hover:text-[#C9A961] transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-braces-line"></i>
                  JSON
                </button>
                <button
                  onClick={() => { handleExportTXT(selectedIdea); setShowDetailModal(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-sm text-white font-medium hover:border-[#C9A961]/30 hover:text-[#C9A961] transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-file-text-line"></i>
                  TXT
                </button>
                <button
                  onClick={() => { handleExportPDF(selectedIdea); setShowDetailModal(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-sm text-white font-medium hover:border-[#C9A961]/30 hover:text-[#C9A961] transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-file-pdf-line"></i>
                  PDF
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedIdea && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-delete-bin-line text-red-400 text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Analyse löschen?</h2>
                <p className="text-gray-400 text-sm">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>
            
            <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-lg p-4 mb-6">
              <p className="text-white font-medium text-sm mb-1">{selectedIdea.title}</p>
              <p className="text-gray-500 text-xs">{new Date(selectedIdea.timestamp).toLocaleDateString('de-DE')} • {selectedIdea.creditsUsed} Credits</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="flex-1 px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm text-white font-medium hover:border-[#3D3428]/50 transition-all cursor-pointer whitespace-nowrap"
              >
                Abbrechen
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close download menu */}
      {showDownloadMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(null)}></div>
      )}
    </div>
  );
}
