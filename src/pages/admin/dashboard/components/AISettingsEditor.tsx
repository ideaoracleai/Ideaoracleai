import { useState, useEffect, useMemo } from 'react';

interface AIPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  settings: AISettings;
}

interface AISettings {
  analysisStyle: string;
  tone: string;
  detailLevel: number;
  strictness: number;
  creativity: number;
  realism: number;
  responseLength: 'kurz' | 'mittel' | 'lang';
  focusAreas: string[];
  customInstructions: string;
  language: string;
  autoRating: boolean;
  showSources: boolean;
  maxTokens: number;
}

interface PresetWeight {
  id: string;
  weight: number;
}

const STORAGE_KEY = 'admin_ai_settings';

const exampleQuestions = [
  { id: 'niche', question: 'Welche profitable Nische empfiehlst du mir?', icon: 'ri-search-line' },
  { id: 'evaluate', question: 'Bewerte meine Idee: Eine App für Hundebesitzer', icon: 'ri-star-line' },
  { id: 'trends', question: 'Welche Trends haben aktuell Potenzial?', icon: 'ri-line-chart-line' },
  { id: 'sharpen', question: 'Wie kann ich meine Nische schärfen?', icon: 'ri-focus-3-line' },
];

const defaultSettings: AISettings = {
  analysisStyle: 'balanced',
  tone: 'professionell',
  detailLevel: 70,
  strictness: 50,
  creativity: 50,
  realism: 70,
  responseLength: 'mittel',
  focusAreas: ['marktanalyse', 'wettbewerb', 'monetarisierung'],
  customInstructions: '',
  language: 'de',
  autoRating: true,
  showSources: true,
  maxTokens: 2000,
};

const presets: AIPreset[] = [
  {
    id: 'strict',
    name: 'Strenge Analyse',
    icon: 'ri-shield-check-line',
    description: 'Kritisch, faktenbasiert, keine Beschönigung. Deckt Schwächen schonungslos auf.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'strict',
      tone: 'direkt',
      detailLevel: 90,
      strictness: 95,
      creativity: 20,
      realism: 95,
      responseLength: 'lang',
      focusAreas: ['risiken', 'wettbewerb', 'finanzen', 'marktanalyse'],
      customInstructions:
        'Sei extrem kritisch. Bewerte Ideen streng und weise auf alle Schwächen hin. Keine Beschönigung.',
    },
  },
  {
    id: 'extreme',
    name: 'EXTREME Analyse',
    icon: 'ri-fire-line',
    description: 'Maximale Strenge, schonungslose Kritik, Worst-Case-Fokus. Nur für harte Realitätschecks.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'extreme',
      tone: 'direkt',
      detailLevel: 100,
      strictness: 100,
      creativity: 5,
      realism: 100,
      responseLength: 'lang',
      focusAreas: ['risiken', 'wettbewerb', 'finanzen', 'marktanalyse', 'umsetzung'],
      customInstructions:
        'Sei EXTREM kritisch und schonungslos. Hinterfrage ALLES. Zeige alle Schwächen, Risiken und Probleme auf. Keine Beschönigung, keine Motivation, nur harte Fakten. Gehe vom Worst-Case aus. Wenn eine Idee scheitern kann, wird sie scheitern. Sei der härteste Kritiker.',
    },
  },
  {
    id: 'professional',
    name: 'Professionell',
    icon: 'ri-briefcase-line',
    description: 'Sachlich, strukturiert, ausgewogen. Wie ein erfahrener Unternehmensberater.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'professional',
      tone: 'professionell',
      detailLevel: 80,
      strictness: 70,
      creativity: 40,
      realism: 80,
      responseLength: 'lang',
      focusAreas: ['marktanalyse', 'wettbewerb', 'monetarisierung', 'skalierung'],
      customInstructions:
        'Antworte wie ein erfahrener Unternehmensberater. Strukturiert, sachlich und mit konkreten Handlungsempfehlungen.',
    },
  },
  {
    id: 'realistic',
    name: 'Realistisch',
    icon: 'ri-eye-line',
    description: 'Ehrlich und praxisnah. Fokus auf machbare Umsetzung und echte Marktdaten.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'realistic',
      tone: 'ehrlich',
      detailLevel: 75,
      strictness: 75,
      creativity: 30,
      realism: 95,
      responseLength: 'mittel',
      focusAreas: ['marktanalyse', 'finanzen', 'risiken', 'umsetzung'],
      customInstructions:
        'Sei realistisch und praxisnah. Verwende echte Marktdaten und zeige machbare Wege auf. Keine unrealistischen Versprechen.',
    },
  },
  {
    id: 'creative',
    name: 'Kreativ & Motivierend',
    icon: 'ri-lightbulb-flash-line',
    description: 'Inspirierend, ideenreich, positiv. Findet Chancen und unkonventionelle Wege.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'creative',
      tone: 'motivierend',
      detailLevel: 60,
      strictness: 30,
      creativity: 95,
      realism: 50,
      responseLength: 'mittel',
      focusAreas: ['innovation', 'trends', 'monetarisierung', 'differenzierung'],
      customInstructions:
        'Sei kreativ und inspirierend. Finde unkonventionelle Chancen und motiviere den Nutzer. Denke out-of-the-box.',
    },
  },
  {
    id: 'balanced',
    name: 'Ausgewogen',
    icon: 'ri-scales-3-line',
    description: 'Gute Mischung aus Kritik und Motivation. Der Standard-Modus.',
    settings: {
      ...defaultSettings,
    },
  },
  {
    id: 'investor',
    name: 'Investor-Perspektive',
    icon: 'ri-funds-line',
    description: 'Wie ein Venture Capitalist. Fokus auf Skalierung, ROI und Exit-Strategie.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'investor',
      tone: 'professionell',
      detailLevel: 85,
      strictness: 85,
      creativity: 40,
      realism: 90,
      responseLength: 'lang',
      focusAreas: ['finanzen', 'skalierung', 'marktanalyse', 'risiken', 'wettbewerb'],
      customInstructions:
        'Bewerte wie ein Investor. Fokus auf: Marktgröße, Skalierbarkeit, Unit Economics, Wettbewerbsvorteil, Exit-Potenzial. Frage nach konkreten Zahlen.',
    },
  },
  {
    id: 'startup-coach',
    name: 'Startup-Coach',
    icon: 'ri-rocket-2-line',
    description: 'Praktischer Mentor für Gründer. Fokus auf schnelle Umsetzung und MVP.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'startup-coach',
      tone: 'motivierend',
      detailLevel: 70,
      strictness: 40,
      creativity: 70,
      realism: 75,
      responseLength: 'mittel',
      focusAreas: ['umsetzung', 'monetarisierung', 'zielgruppe', 'marketing', 'innovation'],
      customInstructions:
        'Sei wie ein Startup-Coach. Fokus auf: MVP, schnelle Validierung, Lean Startup, erste Kunden gewinnen. Gib konkrete nächste Schritte.',
    },
  },
  {
    id: 'market-researcher',
    name: 'Marktforscher',
    icon: 'ri-pie-chart-2-line',
    description: 'Datengetrieben und analytisch. Tiefe Markt- und Wettbewerbsanalyse.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'market-researcher',
      tone: 'akademisch',
      detailLevel: 95,
      strictness: 70,
      creativity: 30,
      realism: 95,
      responseLength: 'lang',
      focusAreas: ['marktanalyse', 'wettbewerb', 'trends', 'zielgruppe'],
      customInstructions:
        "Analysiere wie ein Marktforscher. Verwende Frameworks (TAM/SAM/SOM, Porter's Five Forces). Nenne konkrete Zahlen, Studien und Wettbewerber.",
    },
  },
  {
    id: 'risk-analyst',
    name: 'Risiko-Analyst',
    icon: 'ri-alert-line',
    description: 'Fokus auf Risiken und Worst-Case-Szenarien. Für realistische Planung.',
    settings: {
      ...defaultSettings,
      analysisStyle: 'risk-analyst',
      tone: 'direkt',
      detailLevel: 85,
      strictness: 90,
      creativity: 20,
      realism: 95,
      responseLength: 'lang',
      focusAreas: ['risiken', 'finanzen', 'wettbewerb', 'umsetzung'],
      customInstructions:
        'Identifiziere alle Risiken. Was kann schiefgehen? Worst-Case-Szenarien, Abhängigkeiten, Annahmen hinterfragen. Sei kritisch.',
    },
  },
];

const focusAreaOptions = [
  { id: 'marktanalyse', label: 'Marktanalyse', icon: 'ri-bar-chart-grouped-line' },
  { id: 'wettbewerb', label: 'Wettbewerb', icon: 'ri-sword-line' },
  { id: 'monetarisierung', label: 'Monetarisierung', icon: 'ri-money-euro-circle-line' },
  { id: 'risiken', label: 'Risiken', icon: 'ri-error-warning-line' },
  { id: 'finanzen', label: 'Finanzen', icon: 'ri-wallet-3-line' },
  { id: 'skalierung', label: 'Skalierung', icon: 'ri-rocket-line' },
  { id: 'innovation', label: 'Innovation', icon: 'ri-lightbulb-line' },
  { id: 'trends', label: 'Trends', icon: 'ri-line-chart-line' },
  { id: 'differenzierung', label: 'Differenzierung', icon: 'ri-focus-3-line' },
  { id: 'umsetzung', label: 'Umsetzung', icon: 'ri-tools-line' },
  { id: 'zielgruppe', label: 'Zielgruppe', icon: 'ri-group-line' },
  { id: 'marketing', label: 'Marketing', icon: 'ri-megaphone-line' },
];

const toneOptions = [
  { value: 'direkt', label: 'Direkt & Unverblümt' },
  { value: 'professionell', label: 'Professionell & Sachlich' },
  { value: 'ehrlich', label: 'Ehrlich & Praxisnah' },
  { value: 'motivierend', label: 'Motivierend & Positiv' },
  { value: 'freundlich', label: 'Freundlich & Unterstützend' },
  { value: 'akademisch', label: 'Akademisch & Analytisch' },
];

// Automatische Gewichtung basierend auf Anzahl der Vorlagen
function getAutoWeights(count: number): number[] {
  if (count === 1) return [100];
  if (count === 2) return [60, 40];
  if (count === 3) return [50, 30, 20];
  if (count === 4) return [40, 30, 20, 10];
  // Für mehr als 4: gleichmäßig verteilen
  const weight = Math.floor(100 / count);
  return Array(count).fill(weight);
}

function mergePresetSettings(
  selectedIds: string[], 
  customInstructions: string,
  weights: PresetWeight[]
): AISettings {
  const selected = presets.filter(p => selectedIds.includes(p.id));
  if (selected.length === 0) {
    return { ...defaultSettings, customInstructions };
  }

  // Gewichtungen normalisieren auf 100%
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const normalizedWeights = weights.map(w => ({
    ...w,
    weight: totalWeight > 0 ? (w.weight / totalWeight) * 100 : (1 / weights.length) * 100
  }));

  // Gewichtete Durchschnitte berechnen
  const strictness = Math.round(
    selected.reduce((sum, p) => {
      const weight = normalizedWeights.find(w => w.id === p.id)?.weight || 0;
      return sum + (p.settings.strictness * weight);
    }, 0)
  );

  const realism = Math.round(
    selected.reduce((sum, p) => {
      const weight = normalizedWeights.find(w => w.id === p.id)?.weight || 0;
      return sum + (p.settings.realism * weight);
    }, 0)
  );

  const creativity = Math.round(
    selected.reduce((sum, p) => {
      const weight = normalizedWeights.find(w => w.id === p.id)?.weight || 0;
      return sum + (p.settings.creativity * weight);
    }, 0)
  );

  const detailLevel = Math.round(
    selected.reduce((sum, p) => {
      const weight = normalizedWeights.find(w => w.id === p.id)?.weight || 0;
      return sum + (p.settings.detailLevel * weight);
    }, 0)
  );

  const allFocusAreas = Array.from(
    new Set(selected.flatMap(p => p.settings.focusAreas))
  );

  const lengthPriority: Record<string, number> = { kurz: 1, mittel: 2, lang: 3 };
  const maxLength = selected.reduce((max, p) => {
    return (lengthPriority[p.settings.responseLength] || 0) >
      (lengthPriority[max] || 0)
      ? p.settings.responseLength
      : max;
  }, 'mittel' as 'kurz' | 'mittel' | 'lang');

  const toneCounts: Record<string, number> = {};
  selected.forEach(p => {
    const weight = normalizedWeights.find(w => w.id === p.id)?.weight || 0;
    toneCounts[p.settings.tone] = (toneCounts[p.settings.tone] || 0) + weight;
  });
  const dominantTone = Object.entries(toneCounts).sort((a, b) => b[1] - a[1])[0][0];

  const presetInstructions = selected
    .map(p => p.settings.customInstructions)
    .filter(Boolean);
  const allInstructions = [...presetInstructions];
  if (customInstructions.trim()) {
    allInstructions.push(customInstructions.trim());
  }
  const mergedInstructions = allInstructions.join(' | ');

  const mergedStyle = selected.map(p => p.settings.analysisStyle).join('+');

  return {
    analysisStyle: mergedStyle,
    tone: dominantTone,
    detailLevel,
    strictness,
    creativity,
    realism,
    responseLength: maxLength,
    focusAreas: allFocusAreas,
    customInstructions: mergedInstructions,
    language: 'de',
    autoRating: selected.some(p => p.settings.autoRating),
    showSources: selected.some(p => p.settings.showSources),
    maxTokens: Math.max(...selected.map(p => p.settings.maxTokens)),
  };
}

export default function AISettingsEditor() {
  const [activePresets, setActivePresets] = useState<string[]>(['balanced']);
  const [presetWeights, setPresetWeights] = useState<PresetWeight[]>([{ id: 'balanced', weight: 100 }]);
  const [useManualWeights, setUseManualWeights] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [manualOverrides, setManualOverrides] = useState<Partial<AISettings>>({});
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoRating, setAutoRating] = useState(true);
  const [showSources, setShowSources] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(exampleQuestions[0]);
  const [exampleResponse, setExampleResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const mergedSettings = useMemo(() => {
    const base = mergePresetSettings(activePresets, customInstructions, presetWeights);
    return {
      ...base,
      ...manualOverrides,
      autoRating,
      showSources,
      customInstructions: (() => {
        const presetInstr = presets
          .filter(p => activePresets.includes(p.id))
          .map(p => p.settings.customInstructions)
          .filter(Boolean);
        const all = [...presetInstr];
        if (customInstructions.trim()) all.push(customInstructions.trim());
        return all.join(' | ');
      })(),
    };
  }, [activePresets, customInstructions, manualOverrides, autoRating, showSources, presetWeights]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.activePresets && Array.isArray(parsed.activePresets)) {
          setActivePresets(parsed.activePresets);
        } else if (parsed.activePreset) {
          setActivePresets([parsed.activePreset]);
        }
        if (parsed.presetWeights) {
          setPresetWeights(parsed.presetWeights);
        }
        if (typeof parsed.useManualWeights === 'boolean') {
          setUseManualWeights(parsed.useManualWeights);
        }
        if (parsed.customInstructions) {
          setCustomInstructions(parsed.customInstructions);
        }
        if (parsed.manualOverrides) {
          setManualOverrides(parsed.manualOverrides);
        }
        if (typeof parsed.autoRating === 'boolean') {
          setAutoRating(parsed.autoRating);
        }
        if (typeof parsed.showSources === 'boolean') {
          setShowSources(parsed.showSources);
        }
      } catch (e) {
        console.error('Failed to load AI settings:', e);
      }
    }
  }, []);

  const togglePreset = (presetId: string) => {
    setActivePresets(prev => {
      let next: string[];
      if (prev.includes(presetId)) {
        next = prev.filter(id => id !== presetId);
        if (next.length === 0) next = ['balanced'];
      } else {
        next = [...prev, presetId];
      }

      // Automatische Gewichtung aktualisieren
      const autoWeights = getAutoWeights(next.length);
      const newWeights = next.map((id, index) => ({
        id,
        weight: autoWeights[index] || Math.floor(100 / next.length)
      }));
      setPresetWeights(newWeights);
      
      return next;
    });
    setManualOverrides({});
  };

  const updatePresetWeight = (presetId: string, newWeight: number) => {
    setPresetWeights(prev => {
      const updated = prev.map(w => 
        w.id === presetId ? { ...w, weight: newWeight } : w
      );
      return updated;
    });
  };

  const normalizeWeights = () => {
    const total = presetWeights.reduce((sum, w) => sum + w.weight, 0);
    if (total === 0) return;
    
    setPresetWeights(prev => 
      prev.map(w => ({ ...w, weight: Math.round((w.weight / total) * 100) }))
    );
  };

  const updateManualOverride = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    setManualOverrides(prev => ({ ...prev, [key]: value }));
  };

  const toggleFocusArea = (areaId: string) => {
    const currentAreas =
      (manualOverrides.focusAreas as string[] | undefined) ||
      mergedSettings.focusAreas;
    const newAreas = currentAreas.includes(areaId)
      ? currentAreas.filter(a => a !== areaId)
      : [...currentAreas, areaId];
    updateManualOverride('focusAreas', newAreas);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          settings: mergedSettings,
          activePresets,
          presetWeights,
          useManualWeights,
          customInstructions,
          manualOverrides,
          autoRating,
          showSources,
          isCustom: Object.keys(manualOverrides).length > 0,
        })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Failed to save AI settings:', e);
    }
  };

  const handleReset = () => {
    setActivePresets(['balanced']);
    setPresetWeights([{ id: 'balanced', weight: 100 }]);
    setUseManualWeights(false);
    setCustomInstructions('');
    setManualOverrides({});
    setAutoRating(true);
    setShowSources(true);
  };

  const getSliderColor = (value: number) => {
    if (value <= 30) return 'from-emerald-500 to-emerald-400';
    if (value <= 60) return 'from-[#C9A961] to-[#A08748]';
    if (value <= 80) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  const currentStrictness = (manualOverrides.strictness as number | undefined) ?? mergedSettings.strictness;
  const currentRealism = (manualOverrides.realism as number | undefined) ?? mergedSettings.realism;
  const currentCreativity = (manualOverrides.creativity as number | undefined) ?? mergedSettings.creativity;
  const currentDetailLevel = (manualOverrides.detailLevel as number | undefined) ?? mergedSettings.detailLevel;
  const currentTone = (manualOverrides.tone as string | undefined) ?? mergedSettings.tone;
  const currentResponseLength = (manualOverrides.responseLength as 'kurz' | 'mittel' | 'lang' | undefined) ?? mergedSettings.responseLength;
  const currentFocusAreas = (manualOverrides.focusAreas as string[] | undefined) ?? mergedSettings.focusAreas;

  const totalWeight = presetWeights.reduce((sum, w) => sum + w.weight, 0);

  const getPreviewText = () => {
    const parts: string[] = [];

    const selectedNames = presets
      .filter(p => activePresets.includes(p.id))
      .map(p => p.name);
    if (selectedNames.length > 0) {
      parts.push(`Ich kombiniere die Perspektiven: ${selectedNames.join(', ')}.`);
    }

    if (currentStrictness >= 80) parts.push('Ich werde sehr kritisch bewerten und alle Schwächen aufdecken.');
    else if (currentStrictness >= 50) parts.push('Ich bewerte ausgewogen mit Stärken und Schwächen.');
    else parts.push('Ich schaue wohlwollend auf Chancen und Potenziale.');

    if (currentRealism >= 80) parts.push('Meine Analyse basiert auf realen Marktdaten.');
    else if (currentRealism <= 30) parts.push('Ich denke kreativ und unkonventionell.');

    if (customInstructions.trim()) {
      parts.push(
        `Zusätzlich beachte ich: "${customInstructions
          .trim()
          .substring(0, 80)}${customInstructions.length > 80 ? '...' : ''}"`
      );
    }

    return parts.join(' ');
  };

  // Empfehlungen für optimale Kombinationen
  const recommendations = [
    {
      id: 'best-2',
      title: '🏆 Beste Kombination (2 Vorlagen)',
      presets: ['strict', 'startup-coach'],
      weights: [60, 40],
      description: 'Kritisch aber konstruktiv, mit konkreten Handlungsschritten',
      quality: 'excellent',
      useCase: 'Für die meisten Analysen empfohlen'
    },
    {
      id: 'balanced-3',
      title: '⚖️ Ausgewogen (3 Vorlagen)',
      presets: ['professional', 'realistic', 'investor'],
      weights: [50, 30, 20],
      description: 'Professionell, realistisch und investorenfreundlich',
      quality: 'good',
      useCase: 'Für umfassende Business-Analysen'
    },
    {
      id: 'creative-2',
      title: '💡 Kreativ & Motivierend (2 Vorlagen)',
      presets: ['creative', 'startup-coach'],
      weights: [60, 40],
      description: 'Inspirierend mit praktischen Umsetzungstipps',
      quality: 'excellent',
      useCase: 'Für Ideenfindung und Brainstorming'
    },
    {
      id: 'extreme-check',
      title: '🔥 Harter Realitätscheck (2 Vorlagen)',
      presets: ['extreme', 'risk-analyst'],
      weights: [60, 40],
      description: 'Schonungslose Kritik und Risiko-Fokus',
      quality: 'excellent',
      useCase: 'Für kritische Validierung vor Investitionen'
    },
    {
      id: 'problematic-4',
      title: '⚠️ Problematisch (4 Vorlagen)',
      presets: ['extreme', 'creative', 'investor', 'realistic'],
      weights: [40, 30, 20, 10],
      description: 'Zu viele widersprüchliche Perspektiven',
      quality: 'poor',
      useCase: 'Nicht empfohlen - verwässerte Aussagen'
    }
  ];

  const [showRecommendations, setShowRecommendations] = useState(false);

  const applyRecommendation = (rec: typeof recommendations[0]) => {
    setActivePresets(rec.presets);
    const newWeights = rec.presets.map((id, index) => ({
      id,
      weight: rec.weights[index] || Math.floor(100 / rec.presets.length)
    }));
    setPresetWeights(newWeights);
    setUseManualWeights(false);
    setManualOverrides({});
    
    // Scroll to presets
    setTimeout(() => {
      const presetsSection = document.querySelector('[data-presets-section]');
      if (presetsSection) {
        presetsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const isCurrentRecommendation = (rec: typeof recommendations[0]) => {
    if (activePresets.length !== rec.presets.length) return false;
    const sortedActive = [...activePresets].sort();
    const sortedRec = [...rec.presets].sort();
    return sortedActive.every((id, i) => id === sortedRec[i]);
  };

  const generateExampleResponse = async () => {
    setIsGenerating(true);
    setExampleResponse(null);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500));

    const selectedNames = presets
      .filter(p => activePresets.includes(p.id))
      .map(p => p.name);

    // Generate response based on settings
    let response = '';
    const questionType = selectedQuestion.id;

    // Base response templates
    const baseResponses: Record<string, string> = {
      niche: `**Profitable Nischen-Empfehlungen:**

**1. KI-gestützte Produktivitätstools für Remote-Teams**
- Marktgröße: Stark wachsend
- Wettbewerb: Mittel
- Monetarisierung: SaaS, 15-50€/Monat

**2. Nachhaltige Haustierpflege-Produkte**
- Marktgröße: 2,5 Mrd. € in DACH
- Wettbewerb: Niedrig im Premium-Segment
- Monetarisierung: E-Commerce, Abo-Boxen

**3. Micro-Learning für Fachkräfte**
- Marktgröße: Wachsend
- Wettbewerb: Hoch, Spezialisierung möglich
- Monetarisierung: Kurse, B2B-Lizenzen`,

      evaluate: `**Bewertung: App für Hundebesitzer**

**Positive Aspekte:**
- Großer Markt (10+ Mio. Hundebesitzer in DACH)
- Emotionale Bindung = hohe Zahlungsbereitschaft
- Wiederkehrende Nutzung möglich

**Kritische Punkte:**
- Sehr hoher Wettbewerb (100+ Apps existieren)
- Differenzierung schwierig
- Kundenakquise teuer

**Risiken:**
- CAC könnte Lifetime Value übersteigen
- Feature-Parity mit etablierten Apps nötig`,

      trends: `**Top-Trends mit Business-Potenzial:**

**1. KI-Integration in bestehende Workflows**
- Nicht "noch eine KI-App", sondern KI als Feature
- Beispiel: KI-Assistent für Steuerberater

**2. Klimaneutralität für KMUs**
- Software + Beratung für CO2-Bilanzierung
- Regulatorischer Druck steigt

**3. No-Code-Automatisierung**
- Tools für Nicht-Techniker
- Prozessautomatisierung ohne IT`,

      sharpen: `**Nischen-Schärfung:**

**Aktuell (zu breit):**
"Online-Kurse für Unternehmer"

**Geschärft (besser):**
"5-Tages-Intensivkurse für Solo-Selbstständige im Dienstleistungsbereich, die ihren ersten Mitarbeiter einstellen wollen"

**Warum besser?**
1. Zielgruppe präzise: Solo → erstes Team
2. Zeitrahmen klar: 5 Tage
3. Konkretes Problem: Mitarbeiter-Einstellung
4. Branche definiert: Dienstleistung`
    };

    response = baseResponses[questionType] || baseResponses.niche;

    // Apply strictness
    if (currentStrictness >= 80) {
      response += `\n\n❌ **Strenge Bewertung:** Bei genauer Betrachtung gibt es erhebliche Risiken. Die Umsetzung erfordert deutlich mehr Ressourcen als erwartet.`;
    } else if (currentStrictness >= 50) {
      response += `\n\n⚠️ **Ausgewogene Bewertung:** Potenzial vorhanden, aber mit klaren Herausforderungen.`;
    } else {
      response += `\n\n✅ **Positive Bewertung:** Gute Chancen bei richtiger Umsetzung!`;
    }

    // Apply tone
    const toneAdditions: Record<string, string> = {
      'direkt': '\n\n**Direkt gesagt:** Keine Umschweife – das sind die harten Fakten.',
      'professionell': '\n\n**Professionelle Einschätzung:** Basierend auf Marktanalyse und Best Practices.',
      'ehrlich': '\n\n**Ehrlich betrachtet:** So sieht die Realität aus, ohne Beschönigung.',
      'motivierend': '\n\n**Motivierend:** Du hast definitiv Potenzial! Lass uns das gemeinsam angehen. 💪',
      'freundlich': '\n\n**Freundlicher Hinweis:** Ich bin hier, um dich zu unterstützen!',
      'akademisch': '\n\n**Analytische Perspektive:** Diese Analyse folgt bewährten Business-Frameworks.',
    };
    if (toneAdditions[currentTone]) {
      response += toneAdditions[currentTone];
    }

    // Apply realism
    if (currentRealism >= 80) {
      response += '\n\n📊 **Realitätscheck:** Diese Einschätzung basiert auf aktuellen Marktdaten.';
    } else if (currentRealism <= 30) {
      response += '\n\n🎨 **Kreative Perspektive:** Hier sind auch unkonventionelle Ansätze möglich!';
    }

    // Apply creativity
    if (currentCreativity >= 70) {
      response += '\n\n💡 **Out-of-the-box:** Hast du schon an völlig andere Ansätze gedacht?';
    }

    // Apply focus areas
    if (currentFocusAreas.length > 0) {
      const focusLabels = currentFocusAreas.slice(0, 4).map(a => {
        const opt = focusAreaOptions.find(o => o.id === a);
        return opt?.label || a;
      });
      response += `\n\n🎯 **Meine Schwerpunkte:** ${focusLabels.join(', ')}`;
    }

    // Apply custom instructions
    if (customInstructions.trim()) {
      response += `\n\n📝 **Beachtet:** "${customInstructions.trim().substring(0, 60)}${customInstructions.length > 60 ? '...' : ''}"`;
    }

    // Apply response length
    if (currentResponseLength === 'kurz') {
      response = response.split('\n\n').slice(0, 3).join('\n\n') + '\n\n*(Kurzfassung)*';
    } else if (currentResponseLength === 'lang') {
      response += '\n\n**Zusätzliche Details:** Ich kann jeden dieser Punkte noch detaillierter ausführen. Frag einfach nach!';
    }

    // Add preset info
    if (selectedNames.length > 0) {
      response = `*[Perspektive: ${selectedNames.join(' + ')}]*\n\n` + response;
    }

    // Remove ratings if disabled
    if (!autoRating) {
      response = response.replace(/(?:✅|⚠️|❌)\s*\*\*(?:Strenge |Ausgewogene |Positive )?Bewertung:.*?\n/g, '');
    }

    setExampleResponse(response);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
            <i className="ri-robot-2-line text-[#C9A961] text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">KI-Assistent Einstellungen</h3>
            <p className="text-slate-400 text-xs">Verhalten, Stil und Analyse-Tiefe konfigurieren</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {activePresets.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {activePresets.map(id => {
                const p = presets.find(pr => pr.id === id);
                const weight = presetWeights.find(w => w.id === id)?.weight || 0;
                const normalizedWeight = totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0;
                return p ? (
                  <span
                    key={id}
                    className="px-2.5 py-1 bg-[#C9A961]/15 text-[#C9A961] rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    <i className={`${p.icon} text-xs`}></i>
                    {p.name}
                    {activePresets.length > 1 && (
                      <span className="ml-1 text-[10px] opacity-75">({normalizedWeight}%)</span>
                    )}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-blue-400 text-xl mt-0.5"></i>
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-1">Intelligente Gewichtung aktiv</h4>
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Die KI kombiniert automatisch alle Perspektiven mit intelligenter Gewichtung. Bei mehreren Vorlagen wird die erste stärker gewichtet (Primär-Vorlage). Du kannst die Gewichtung auch manuell anpassen.
            </p>
          </div>
        </div>
      </div>

      {/* Empfehlungen für optimale Ergebnisse */}
      <div className="bg-gradient-to-br from-[#C9A961]/10 to-[#A08748]/5 border border-[#C9A961]/30 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-[#C9A961]/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center">
              <i className="ri-lightbulb-flash-line text-[#0F1419] text-xl"></i>
            </div>
            <div className="text-left">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                💡 Empfehlungen für optimale Ergebnisse
                <span className="px-2 py-0.5 bg-[#C9A961]/20 text-[#C9A961] rounded text-[10px] font-bold">NEU</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Bewährte Vorlagen-Kombinationen für beste Analyse-Qualität
              </p>
            </div>
          </div>
          <i className={`ri-arrow-${showRecommendations ? 'up' : 'down'}-s-line text-[#C9A961] text-2xl transition-transform`}></i>
        </button>

        {showRecommendations && (
          <div className="p-5 pt-0 space-y-3">
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <i className="ri-information-line text-blue-400 text-sm mt-0.5"></i>
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  Diese Kombinationen wurden getestet und liefern die besten Ergebnisse. Klicke auf eine Empfehlung, um sie direkt anzuwenden.
                </p>
              </div>
            </div>

            {recommendations.map((rec) => {
              const isCurrent = isCurrentRecommendation(rec);
              const qualityColors = {
                excellent: 'border-emerald-500/40 bg-emerald-500/5',
                good: 'border-[#C9A961]/40 bg-[#C9A961]/5',
                poor: 'border-red-500/40 bg-red-500/5'
              };
              const qualityIcons = {
                excellent: 'ri-star-fill text-emerald-400',
                good: 'ri-thumb-up-line text-[#C9A961]',
                poor: 'ri-error-warning-line text-red-400'
              };

              return (
                <div
                  key={rec.id}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    isCurrent 
                      ? 'border-[#C9A961] bg-[#C9A961]/10 shadow-lg shadow-[#C9A961]/10' 
                      : qualityColors[rec.quality]
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-sm font-bold text-white">{rec.title}</h5>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-[#C9A961] text-[#0F1419] rounded text-[10px] font-bold">
                              AKTIV
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{rec.description}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <i className={`${qualityIcons[rec.quality]} text-sm`}></i>
                          <span>{rec.useCase}</span>
                        </div>
                      </div>
                      {!isCurrent && rec.quality !== 'poor' && (
                        <button
                          onClick={() => applyRecommendation(rec)}
                          className="ml-3 px-3 py-1.5 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                        >
                          <i className="ri-check-line"></i>
                          Anwenden
                        </button>
                      )}
                      {rec.quality === 'poor' && (
                        <div className="ml-3 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                          <i className="ri-close-line"></i>
                          Vermeiden
                        </div>
                      )}
                    </div>

                    {/* Vorlagen-Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {rec.presets.map((presetId, index) => {
                        const preset = presets.find(p => p.id === presetId);
                        const weight = rec.weights[index];
                        return preset ? (
                          <span
                            key={presetId}
                            className={`px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                              isCurrent
                                ? 'bg-[#C9A961]/20 text-[#C9A961]'
                                : rec.quality === 'poor'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-slate-700/60 text-slate-300'
                            }`}
                          >
                            <i className={`${preset.icon} text-[9px]`}></i>
                            {preset.name}
                            <span className="opacity-75">({weight}%)</span>
                          </span>
                        ) : null;
                      })}
                    </div>

                    {/* Qualitäts-Indikator */}
                    {rec.quality === 'excellent' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <i key={i} className="ri-star-fill text-[10px]"></i>
                          ))}
                        </div>
                        <span className="font-medium">Exzellente Qualität</span>
                      </div>
                    )}
                    {rec.quality === 'good' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-[#C9A961]">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4].map(i => (
                            <i key={i} className="ri-star-fill text-[10px]"></i>
                          ))}
                          <i className="ri-star-line text-[10px]"></i>
                        </div>
                        <span className="font-medium">Gute Qualität</span>
                      </div>
                    )}
                    {rec.quality === 'poor' && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                        <div className="flex gap-0.5">
                          {[1, 2].map(i => (
                            <i key={i} className="ri-star-fill text-[10px]"></i>
                          ))}
                          {[1, 2, 3].map(i => (
                            <i key={i} className="ri-star-line text-[10px]"></i>
                          ))}
                        </div>
                        <span className="font-medium">Verwässerte Qualität - Nicht empfohlen</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Zusätzliche Tipps */}
            <div className="mt-4 p-4 bg-slate-800/60 border border-slate-700 rounded-lg">
              <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <i className="ri-lightbulb-line text-[#C9A961]"></i>
                Profi-Tipps
              </h5>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <i className="ri-checkbox-circle-line text-emerald-400 mt-0.5 flex-shrink-0"></i>
                  <span><strong className="text-white">2 Vorlagen sind optimal:</strong> Klare Perspektive ohne Verwässerung</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-checkbox-circle-line text-emerald-400 mt-0.5 flex-shrink-0"></i>
                  <span><strong className="text-white">Primär-Vorlage zählt:</strong> Die erste Vorlage hat den größten Einfluss</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-checkbox-circle-line text-emerald-400 mt-0.5 flex-shrink-0"></i>
                  <span><strong className="text-white">Gegensätze vermeiden:</strong> "EXTREME" + "Kreativ" = widersprüchlich</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-alert-line text-orange-400 mt-0.5 flex-shrink-0"></i>
                  <span><strong className="text-white">Maximal 3 Vorlagen:</strong> Bei 4+ Vorlagen wird das Ergebnis zu allgemein</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Warning bei 4+ Vorlagen */}
      {activePresets.length >= 4 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="ri-alert-line text-orange-400 text-xl mt-0.5"></i>
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-1">Achtung: Viele Vorlagen</h4>
              <p className="text-xs text-orange-300/80 leading-relaxed">
                Du hast {activePresets.length} Vorlagen ausgewählt. Das kann das Ergebnis verwässern. 
                <strong> Empfohlen: Maximal 2-3 Vorlagen</strong> für optimale Ergebnisse.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Presets - Multi-Select */}
      <div data-presets-section>
        <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <i className="ri-magic-line text-[#C9A961]"></i>
          Vorlagen
          <span className="text-xs font-normal text-slate-400">(Mehrfachauswahl möglich)</span>
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Wähle eine oder mehrere Vorlagen. Die erste Vorlage ist die Primär-Vorlage mit höchster Gewichtung.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((preset, index) => {
            const isActive = activePresets.includes(preset.id);
            const activeIndex = activePresets.indexOf(preset.id);
            const isPrimary = activeIndex === 0;
            return (
              <button
                key={preset.id}
                onClick={() => togglePreset(preset.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer group relative ${
                  isActive
                    ? isPrimary
                      ? 'border-[#C9A961] bg-[#C9A961]/15 shadow-lg shadow-[#C9A961]/10'
                      : 'border-[#C9A961]/60 bg-[#C9A961]/8 shadow-md shadow-[#C9A961]/5'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                }`}
              >
                {isPrimary && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-full flex items-center justify-center shadow-lg">
                    <i className="ri-star-fill text-[#0F1419] text-xs"></i>
                  </div>
                )}
                
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    isActive ? 'bg-[#C9A961] border-[#C9A961]' : 'border-slate-600 group-hover:border-slate-500'
                  }`}
                >
                  {isActive && <i className="ri-check-line text-[#0F1419] text-xs font-bold"></i>}
                </div>

                <div className="flex items-center gap-3 mb-2 pr-6">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isActive
                        ? 'bg-[#C9A961]/20 text-[#C9A961]'
                        : 'bg-slate-700 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    <i className={`${preset.icon} text-lg`}></i>
                  </div>
                  <div>
                    <span
                      className={`font-semibold text-sm ${isActive ? 'text-[#C9A961]' : 'text-white'}`}
                    >
                      {preset.name}
                    </span>
                    {isPrimary && (
                      <span className="block text-[10px] text-[#C9A961]/80 font-medium">Primär-Vorlage</span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gewichtungs-Steuerung */}
      {activePresets.length > 1 && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-[#C9A961]/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
                <i className="ri-scales-3-line text-[#C9A961] text-lg"></i>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Gewichtungs-Steuerung</h4>
                <p className="text-xs text-slate-400">
                  Passe an, wie stark jede Vorlage die Analyse beeinflusst
                </p>
              </div>
            </div>
            <button
              onClick={() => setUseManualWeights(!useManualWeights)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                useManualWeights
                  ? 'bg-[#C9A961] text-[#0F1419]'
                  : 'bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <i className={`${useManualWeights ? 'ri-hand-coin-line' : 'ri-magic-line'} mr-1`}></i>
              {useManualWeights ? 'Manuell' : 'Automatisch'}
            </button>
          </div>

          {!useManualWeights && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <i className="ri-magic-line text-blue-400 text-sm mt-0.5"></i>
                <p className="text-xs text-blue-300/80 leading-relaxed">
                  <strong>Automatische Gewichtung aktiv:</strong> Die Gewichtung wird automatisch optimiert basierend auf der Anzahl der Vorlagen.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {activePresets.map((presetId, index) => {
              const preset = presets.find(p => p.id === presetId);
              const weight = presetWeights.find(w => w.id === presetId)?.weight || 0;
              const normalizedWeight = totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0;
              const isPrimary = index === 0;

              return preset ? (
                <div key={presetId} className="bg-slate-900/60 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <i className={`${preset.icon} text-[#C9A961]`}></i>
                      <span className="text-sm font-semibold text-white">{preset.name}</span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 bg-[#C9A961]/20 text-[#C9A961] rounded text-[10px] font-bold">
                          PRIMÄR
                        </span>
                      )}
                    </div>
                    <span className="text-lg font-bold text-[#C9A961]">{normalizedWeight}%</span>
                  </div>
                  
                  {useManualWeights && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#C9A961] to-[#A08748] rounded-full transition-all"
                            style={{ width: `${weight}%` }}
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={weight}
                          onChange={e => updatePresetWeight(presetId, parseInt(e.target.value))}
                          onMouseUp={normalizeWeights}
                          onTouchEnd={normalizeWeights}
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-12 text-right">{weight}%</span>
                    </div>
                  )}

                  {!useManualWeights && (
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C9A961] to-[#A08748] rounded-full transition-all"
                        style={{ width: `${normalizedWeight}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : null;
            })}
          </div>

          {useManualWeights && totalWeight !== 100 && (
            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className="ri-error-warning-line text-orange-400"></i>
                  <span className="text-xs text-orange-300">
                    Gesamt: {totalWeight}% (sollte 100% sein)
                  </span>
                </div>
                <button
                  onClick={normalizeWeights}
                  className="px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-refresh-line mr-1"></i>
                  Normalisieren
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Presets Combination Summary */}
      {activePresets.length > 1 && (
        <div className="bg-[#C9A961]/5 border border-[#C9A961]/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#C9A961]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <i className="ri-merge-cells-horizontal text-[#C9A961]"></i>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#C9A961] mb-2">
                Kombinierte Einstellungen ({activePresets.length} Vorlagen)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-400">Strenge</div>
                  <div className="text-sm font-bold text-white">{currentStrictness}%</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-400">Realismus</div>
                  <div className="text-sm font-bold text-white">{currentRealism}%</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-400">Kreativität</div>
                  <div className="text-sm font-bold text-white">{currentCreativity}%</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-400">Detail-Tiefe</div>
                  <div className="text-sm font-bold text-white">{currentDetailLevel}%</div>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentFocusAreas.map(area => {
                  const opt = focusAreaOptions.find(o => o.id === area);
                  return opt ? (
                    <span
                      key={area}
                      className="px-2 py-0.5 bg-slate-700/60 rounded text-xs text-slate-300 flex items-center gap-1"
                    >
                      <i className={`${opt.icon} text-[10px]`}></i>
                      {opt.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Instructions */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-[#C9A961]/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
            <i className="ri-quill-pen-line text-[#C9A961] text-lg"></i>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Benutzerdefinierte Anweisungen</h4>
            <p className="text-xs text-slate-400">
              Zusätzliche Anweisungen, die mit den Vorlagen kombiniert werden
            </p>
          </div>
        </div>
        <textarea
          value={customInstructions}
          onChange={e => {
            if (e.target.value.length <= 500) {
              setCustomInstructions(e.target.value);
            }
          }}
          placeholder='z.B. "Fokussiere dich auf den DACH-Markt", "Verwende immer konkrete Zahlen", "Vergleiche mit bestehenden Wettbewerbern", "Antworte immer mit Beispielen"...'
          rows={4}
          className="w-full px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#C9A961]/50 transition-colors text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-500">
            <i className="ri-information-line mr-1"></i>
            Diese Anweisungen werden automatisch mit den ausgewählten Vorlagen kombiniert.
          </p>
          <span className={`text-xs ${customInstructions.length > 450 ? 'text-orange-400' : 'text-slate-500'}`}>
            {customInstructions.length}/500
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700 pt-6">
        <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          <i className="ri-settings-4-line text-[#C9A961]"></i>
          Manuelle Feinabstimmung
          <span className="text-xs font-normal text-slate-400">
            (optional, überschreibt Vorlagen-Werte)
          </span>
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Passe die kombinierten Werte manuell an, wenn du etwas feinjustieren möchtest.
        </p>
      </div>

      {/* Tone */}
      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">Tonalität</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {toneOptions.map(option => (
            <button
              key={option.value}
              onClick={() => updateManualOverride('tone', option.value)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                currentTone === option.value
                  ? 'bg-[#C9A961] text-[#0F1419]'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        {/* Strictness */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <i className="ri-shield-check-line text-[#C9A961]"></i>
              Strenge
            </label>
            <span className="text-sm font-bold text-white">{currentStrictness}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-16">Mild</span>
            <div className="flex-1 relative">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getSliderColor(currentStrictness)} rounded-full transition-all`}
                  style={{ width: `${currentStrictness}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentStrictness}
                onChange={e => updateManualOverride('strictness', parseInt(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-slate-500 w-16 text-right">Streng</span>
          </div>
        </div>

        {/* Realism */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <i className="ri-eye-line text-[#C9A961]"></i>
              Realismus
            </label>
            <span className="text-sm font-bold text-white">{currentRealism}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-16">Kreativ</span>
            <div className="flex-1 relative">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getSliderColor(currentRealism)} rounded-full transition-all`}
                  style={{ width: `${currentRealism}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentRealism}
                onChange={e => updateManualOverride('realism', parseInt(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-slate-500 w-16 text-right">Realistisch</span>
          </div>
        </div>

        {/* Creativity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <i className="ri-lightbulb-flash-line text-[#C9A961]"></i>
              Kreativität
            </label>
            <span className="text-sm font-bold text-white">{currentCreativity}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-16">Konservativ</span>
            <div className="flex-1 relative">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getSliderColor(currentCreativity)} rounded-full transition-all`}
                  style={{ width: `${currentCreativity}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentCreativity}
                onChange={e => updateManualOverride('creativity', parseInt(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-slate-500 w-16 text-right">Kreativ</span>
          </div>
        </div>

        {/* Detail Level */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <i className="ri-file-list-3-line text-[#C9A961]"></i>
              Detail-Tiefe
            </label>
            <span className="text-sm font-bold text-white">{currentDetailLevel}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-16">Kompakt</span>
            <div className="flex-1 relative">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getSliderColor(currentDetailLevel)} rounded-full transition-all`}
                  style={{ width: `${currentDetailLevel}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentDetailLevel}
                onChange={e => updateManualOverride('detailLevel', parseInt(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-slate-500 w-16 text-right">Detailliert</span>
          </div>
        </div>
      </div>

      {/* Response Length */}
      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">Antwortlänge</label>
        <div className="flex gap-2">
          {(['kurz', 'mittel', 'lang'] as const).map(length => (
            <button
              key={length}
              onClick={() => updateManualOverride('responseLength', length)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                currentResponseLength === length
                  ? 'bg-[#C9A961] text-[#0F1419]'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'
              }`}
            >
              {length === 'kurz' && 'Kurz & Knapp'}
              {length === 'mittel' && 'Mittel'}
              {length === 'lang' && 'Ausführlich'}
            </button>
          ))}
        </div>
      </div>

      {/* Focus Areas */}
      <div>
        <label className="text-sm font-medium text-slate-300 mb-3 block">Analyse-Schwerpunkte</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {focusAreaOptions.map(area => (
            <button
              key={area.id}
              onClick={() => toggleFocusArea(area.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                currentFocusAreas.includes(area.id)
                  ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600'
              }`}
            >
              <i className={`${area.icon} text-base`}></i>
              {area.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            <i className="ri-star-line text-[#C9A961]"></i>
            <div>
              <span className="text-sm font-medium text-white">Automatische Bewertung</span>
              <p className="text-xs text-slate-400">
                Jede Analyse erhält automatisch eine Bewertung (Gut/Mittel/Schlecht)
              </p>
            </div>
          </div>
          <button
            onClick={() => setAutoRating(!autoRating)}
            className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${
              autoRating ? 'bg-[#C9A961]' : 'bg-slate-600'
            }`}
          >
            <div
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
              style={{ left: autoRating ? '22px' : '2px' }}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-3">
            <i className="ri-links-line text-[#C9A961]"></i>
            <div>
              <span className="text-sm font-medium text-white">Quellen anzeigen</span>
              <p className="text-xs text-slate-400">
                Verweise auf Datenquellen und Marktdaten in Antworten
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSources(!showSources)}
            className={`w-11 h-6 rounded-full transition-all cursor-pointer relative ${
              showSources ? 'bg-[#C9A961]' : 'bg-slate-600'
            }`}
          >
            <div
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
              style={{ left: showSources ? '22px' : '2px' }}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 text-sm text-[#C9A961] hover:text-[#A08748] transition-colors cursor-pointer"
        >
          <i className={showPreview ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
          {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
        </button>
        {showPreview && (
          <div className="mt-3 space-y-4">
            {/* Settings Summary */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center">
                  <i className="ri-robot-2-line text-[#0F1419] text-sm"></i>
                </div>
                <span className="text-sm font-semibold text-white">KI-Verhalten</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">"{getPreviewText()}"</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                  Strenge: {currentStrictness}%
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                  Realismus: {currentRealism}%
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                  Kreativität: {currentCreativity}%
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">Ton: {currentTone}</span>
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                  Länge: {currentResponseLength}
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                  Vorlagen: {activePresets.length}
                </span>
              </div>
            </div>

            {/* Live Example Response */}
            <div className="p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/60 rounded-xl border border-[#C9A961]/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
                    <i className="ri-chat-3-line text-[#C9A961] text-sm"></i>
                  </div>
                  <span className="text-sm font-semibold text-white">Live-Beispiel</span>
                </div>
                <span className="text-xs text-slate-500">Teste deine Einstellungen</span>
              </div>

              {/* Question Selector */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-2 block">Beispiel-Frage auswählen:</label>
                <div className="grid grid-cols-2 gap-2">
                  {exampleQuestions.map(q => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setExampleResponse(null);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-left ${
                        selectedQuestion.id === q.id
                          ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30'
                          : 'bg-slate-700/50 text-slate-400 hover:text-white border border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <i className={`${q.icon} text-sm flex-shrink-0`}></i>
                      <span className="truncate">{q.question}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Question Display */}
              <div className="mb-4 p-3 bg-slate-900/60 rounded-lg border border-slate-700">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-user-line text-slate-400 text-xs"></i>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Benutzer fragt:</span>
                    <p className="text-sm text-white">{selectedQuestion.question}</p>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateExampleResponse}
                disabled={isGenerating}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-sm flex items-center justify-center gap-2 mb-4 ${
                  isGenerating
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] hover:shadow-lg hover:shadow-[#C9A961]/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    KI generiert Antwort...
                  </>
                ) : (
                  <>
                    <i className="ri-magic-line"></i>
                    Beispiel-Antwort generieren
                  </>
                )}
              </button>

              {/* Generated Response */}
              {exampleResponse && (
                <div className="p-4 bg-slate-900/80 rounded-lg border border-slate-700">
                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-robot-2-line text-[#0F1419] text-xs"></i>
                    </div>
                    <div>
                      <span className="text-xs text-[#C9A961] block mb-1">KI-Assistent antwortet:</span>
                    </div>
                  </div>
                  <div className="pl-8">
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                      {exampleResponse.split('\n').map((line, i) => {
                        if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={i} className="font-bold text-white my-2">{line.replace(/\*\*/g, '')}</p>;
                        }
                        if (line.startsWith('*[') && line.endsWith(']*')) {
                          return <p key={i} className="text-[#C9A961] text-xs italic mb-2">{line.replace(/\*|\[|\]/g, '')}</p>;
                        }
                        if (line.startsWith('- ')) {
                          return <p key={i} className="ml-4 text-slate-400 my-1">{line}</p>;
                        }
                        if (line.includes('✅') || line.includes('⚠️') || line.includes('❌') || line.includes('💡') || line.includes('📊') || line.includes('🎨') || line.includes('🎯') || line.includes('📝') || line.includes('💪')) {
                          return <p key={i} className="my-2 p-2 bg-slate-800/50 rounded text-sm">{line}</p>;
                        }
                        return line ? <p key={i} className="my-1">{line}</p> : <br key={i} />;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {!exampleResponse && !isGenerating && (
                <div className="text-center py-6 text-slate-500">
                  <i className="ri-chat-smile-2-line text-3xl mb-2 block opacity-50"></i>
                  <p className="text-xs">Klicke auf "Beispiel-Antwort generieren" um zu sehen, wie die KI mit deinen Einstellungen antwortet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        <button
          onClick={handleReset}
          className="px-4 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer whitespace-nowrap text-sm flex items-center gap-2"
        >
          <i className="ri-refresh-line"></i>
          Zurücksetzen
        </button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-emerald-400 text-sm flex items-center gap-1 animate-pulse">
              <i className="ri-check-line"></i>
              Gespeichert!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap text-sm flex items-center gap-2"
          >
            <i className="ri-save-line"></i>
            Einstellungen speichern
          </button>
        </div>
      </div>
    </div>
  );
}
