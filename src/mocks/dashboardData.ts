export const userProfile = {
  name: "Max Mustermann",
  email: "max@beispiel.de",
  plan: "Starter", // Starter, Pro, oder Builder
  planPrice: 39.90,
  credits: 1250,
  maxCredits: 2500, // Starter: 2500, Pro: 5000, Builder: unlimited
  memberSince: "Januar 2025",
  nextReset: "01. Februar 2025"
};

export interface IdeaAnalysis {
  id: number;
  title: string;
  timestamp: string;
  rating: string;
  creditsUsed: number;
  category: string;
  targetAudience: string;
  marketSize: number;
  competition: number;
  startupCost: number;
  timeToMarket: number;
  profitPotential: number;
  scalability: number;
  analysis: {
    marketAnalysis: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    recommendations: string[];
  };
}

export const ideaHistory: IdeaAnalysis[] = [
  {
    id: 1,
    title: "Online-Kochkurs für Senioren",
    timestamp: "2025-01-28T10:30:00Z",
    rating: "gut",
    creditsUsed: 30,
    category: "Bildung & E-Learning",
    targetAudience: "Senioren 60+",
    marketSize: 7,
    competition: 3,
    startupCost: 5,
    timeToMarket: 6,
    profitPotential: 8,
    scalability: 9,
    analysis: {
      marketAnalysis: "Wachsender Markt, geringe Konkurrenz, gutes Timing durch demografischen Wandel. Die Zielgruppe wird immer digitaler und sucht nach Möglichkeiten, neue Fähigkeiten zu erlernen.",
      swot: {
        strengths: [
          "Demografischer Wandel spielt in die Karten",
          "Geringe digitale Konkurrenz in dieser Zielgruppe",
          "Wiederkehrende Einnahmen durch Abo-Modell möglich",
          "Hohe Kundenbindung bei guter Qualität"
        ],
        weaknesses: [
          "Technische Hürden bei der Zielgruppe",
          "Aufwändige Kundenakquise",
          "Hoher Support-Bedarf"
        ],
        opportunities: [
          "Kooperationen mit Seniorenheimen",
          "Erweiterung auf andere Altersgruppen",
          "Zusatzprodukte wie Kochboxen"
        ],
        threats: [
          "Etablierte Kochplattformen könnten Zielgruppe entdecken",
          "Wirtschaftliche Unsicherheit bei Rentnern"
        ]
      },
      recommendations: [
        "Start mit kostenlosen Schnupperkursen",
        "Einfache, barrierefreie Plattform entwickeln",
        "Persönlicher Support als USP",
        "Community-Features für soziale Interaktion"
      ]
    }
  },
  {
    id: 2,
    title: "NFT-Marktplatz für Kunst",
    timestamp: "2025-01-25T14:20:00Z",
    rating: "schlecht",
    creditsUsed: 30,
    category: "Blockchain & Krypto",
    targetAudience: "Krypto-Enthusiasten, Kunstsammler",
    marketSize: 4,
    competition: 9,
    startupCost: 2,
    timeToMarket: 3,
    profitPotential: 2,
    scalability: 5,
    analysis: {
      marketAnalysis: "Übersättigter Markt, sinkende Nachfrage, hohe technische Hürden. Der NFT-Hype ist vorbei und die Branche konsolidiert sich stark.",
      swot: {
        strengths: [
          "Technologie ist etabliert",
          "Globaler Markt ohne geografische Grenzen"
        ],
        weaknesses: [
          "Markt ist stark übersättigt",
          "NFT-Hype ist vorbei, Nachfrage sinkt",
          "Sehr hohe technische Komplexität",
          "Regulatorische Unsicherheiten",
          "Hohe Marketing-Kosten nötig"
        ],
        opportunities: [
          "Fokus auf spezielle Kunst-Nischen",
          "Integration mit physischen Kunstwerken"
        ],
        threats: [
          "Weitere Marktkonsolidierung",
          "Negative Medienberichterstattung",
          "Regulatorische Einschränkungen",
          "Umweltbedenken bei Blockchain"
        ]
      },
      recommendations: [
        "Von dieser Idee wird stark abgeraten",
        "Falls dennoch: Extreme Nischenfokussierung nötig",
        "Alternative: Traditioneller Online-Kunstmarktplatz"
      ]
    }
  },
  {
    id: 3,
    title: "Abo-Box für Heimwerker",
    timestamp: "2025-01-22T09:15:00Z",
    rating: "mittel",
    creditsUsed: 30,
    category: "E-Commerce & Abo-Modelle",
    targetAudience: "Hobby-Heimwerker, DIY-Enthusiasten",
    marketSize: 6,
    competition: 7,
    startupCost: 4,
    timeToMarket: 5,
    profitPotential: 6,
    scalability: 5,
    analysis: {
      marketAnalysis: "Interessante Nische, aber hohe Logistikkosten und starke Konkurrenz durch Baumärkte. Das Abo-Modell funktioniert gut bei treuen Kunden.",
      swot: {
        strengths: [
          "Abo-Modell sorgt für planbare Einnahmen",
          "Treue Community bei DIY-Enthusiasten",
          "Überraschungseffekt kann Kundenbindung stärken"
        ],
        weaknesses: [
          "Hohe Logistik- und Versandkosten",
          "Starke Konkurrenz durch Baumärkte",
          "Schwierige Produktauswahl (nicht jeder braucht alles)",
          "Hohe Retourenquote möglich"
        ],
        opportunities: [
          "Spezialisierung auf bestimmte Projekte",
          "Video-Tutorials als Mehrwert",
          "Community-Plattform für Austausch"
        ],
        threats: [
          "Baumärkte könnten eigene Abo-Modelle starten",
          "Wirtschaftliche Unsicherheit reduziert Ausgaben für Hobbys"
        ]
      },
      recommendations: [
        "Fokus auf spezifische Projekt-Boxen statt allgemeine Werkzeuge",
        "Kooperationen mit YouTube-DIY-Kanälen",
        "Flexible Abo-Modelle (monatlich pausierbar)",
        "Starker Content-Marketing-Fokus"
      ]
    }
  },
  {
    id: 4,
    title: "KI-gestützte Steuerberatung",
    timestamp: "2025-01-18T16:45:00Z",
    rating: "gut",
    creditsUsed: 30,
    category: "FinTech & SaaS",
    targetAudience: "Selbstständige, Freelancer, kleine Unternehmen",
    marketSize: 9,
    competition: 6,
    startupCost: 5,
    timeToMarket: 6,
    profitPotential: 9,
    scalability: 10,
    analysis: {
      marketAnalysis: "Hohe Nachfrage, regulatorische Hürden beherrschbar, starkes Wachstumspotenzial. Der Markt für digitale Steuerberatung wächst rasant.",
      swot: {
        strengths: [
          "Riesiger Markt mit echtem Bedarf",
          "Wiederkehrende Einnahmen garantiert",
          "KI kann echten Mehrwert bieten",
          "Hohe Zahlungsbereitschaft",
          "Skalierbar ohne proportionale Kostensteigerung"
        ],
        weaknesses: [
          "Regulatorische Anforderungen müssen erfüllt werden",
          "Haftungsfragen müssen geklärt sein",
          "Vertrauen muss aufgebaut werden",
          "Komplexe Entwicklung"
        ],
        opportunities: [
          "Erweiterung auf andere Länder",
          "Zusatzservices wie Buchhaltung",
          "B2B-Angebote für Steuerberater",
          "Integration mit Buchhaltungssoftware"
        ],
        threats: [
          "Etablierte Anbieter könnten KI integrieren",
          "Änderungen im Steuerrecht",
          "Datenschutz-Bedenken"
        ]
      },
      recommendations: [
        "Kooperation mit echten Steuerberatern für rechtliche Absicherung",
        "Start mit einfachen Anwendungsfällen (Freelancer)",
        "Transparente Kommunikation über KI-Grenzen",
        "Starker Fokus auf Datensicherheit und Compliance",
        "Freemium-Modell für schnelles Wachstum"
      ]
    }
  },
  {
    id: 5,
    title: "Vegane Tiernahrung",
    timestamp: "2025-01-15T11:30:00Z",
    rating: "mittel",
    creditsUsed: 30,
    category: "E-Commerce & Nachhaltigkeit",
    targetAudience: "Vegane Tierhalter, umweltbewusste Haustierbesitzer",
    marketSize: 4,
    competition: 5,
    startupCost: 5,
    timeToMarket: 5,
    profitPotential: 5,
    scalability: 4,
    analysis: {
      marketAnalysis: "Nischenmarkt mit treuer Zielgruppe, aber begrenzte Skalierbarkeit. Die vegane Community wächst, aber die Zielgruppe bleibt klein.",
      swot: {
        strengths: [
          "Wachsende vegane Community",
          "Hohe Kundenloyalität in der Nische",
          "Wenig direkte Konkurrenz",
          "Wiederkehrende Käufe garantiert"
        ],
        weaknesses: [
          "Sehr kleine Zielgruppe",
          "Kontroverse Diskussionen um vegane Tierernährung",
          "Hohe Qualitätsanforderungen",
          "Begrenzte Skalierbarkeit"
        ],
        opportunities: [
          "Expansion in vegetarische Tiernahrung",
          "Nachhaltigkeits-Positionierung",
          "Abo-Modell für regelmäßige Lieferungen",
          "Kooperationen mit Tierärzten"
        ],
        threats: [
          "Große Futtermittelhersteller könnten Markt betreten",
          "Wissenschaftliche Studien könnten negativ ausfallen",
          "Regulatorische Einschränkungen möglich"
        ]
      },
      recommendations: [
        "Enge Zusammenarbeit mit Tierärzten und Ernährungsexperten",
        "Transparente Kommunikation über Nährstoffe",
        "Community-Aufbau als Kernstrategie",
        "Start mit Hunden (einfacher als Katzen)",
        "Wissenschaftliche Studien zur Untermauerung"
      ]
    }
  }
];

export const creditHistory = [
  { date: "28. Jan 2025", action: "Idee analysiert", change: -30 },
  { date: "25. Jan 2025", action: "Idee analysiert", change: -30 },
  { date: "22. Jan 2025", action: "Idee analysiert", change: -30 },
  { date: "01. Jan 2025", action: "Monatlicher Reset", change: 90 }
];

export const stats = {
  totalAnalyses: 5,
  goodRatings: 2,
  mediumRatings: 2,
  badRatings: 1
};

export const notifications = [
  {
    id: 1,
    type: "credit",
    title: "Credits zurückgesetzt",
    message: "Deine monatlichen Credits wurden auf 90 zurückgesetzt.",
    time: "vor 2 Stunden",
    read: false
  },
  {
    id: 2,
    type: "analysis",
    title: "Analyse abgeschlossen",
    message: "Deine Idee 'Online-Kochkurs für Senioren' wurde bewertet.",
    time: "vor 1 Tag",
    read: false
  },
  {
    id: 3,
    type: "tip",
    title: "Tipp des Tages",
    message: "Nischen mit wiederkehrenden Einnahmen sind oft profitabler.",
    time: "vor 2 Tagen",
    read: true
  },
  {
    id: 4,
    type: "update",
    title: "Neue Funktion verfügbar",
    message: "Der Builder-Briefing ist jetzt für alle Premium-Nutzer freigeschaltet.",
    time: "vor 3 Tagen",
    read: true
  },
  {
    id: 5,
    type: "warning",
    title: "Credits niedrig",
    message: "Du hast noch 45 Credits übrig. Nächster Reset in 4 Tagen.",
    time: "vor 5 Tagen",
    read: true
  }
];

// Admin Mock Data - Erweitert mit Zahlungsinformationen
export const adminUsers = [
  {
    id: '1',
    email: 'user@example.com',
    name: 'Max Mustermann',
    plan: 'Starter',
    credits: 2500,
    joinDate: '2024-01-15',
    lastActive: '2024-01-20',
    totalSpent: 0,
    isBlocked: false,
    isFree: false,
    subscriptionStatus: 'active',
    cancelledAt: null,
    cancelledEffectiveDate: null,
    cancellationReason: null,
    paymentMethod: {
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2026
    },
    billingAddress: {
      name: 'Max Mustermann',
      street: 'Musterstrasse 123',
      city: 'Zürich',
      postalCode: '8001',
      country: 'Schweiz'
    },
    transactions: [
      {
        id: 'TXN-1705847001',
        date: '2024-01-15T10:00:00Z',
        description: 'Starter Paket - Monatlich',
        amount: 0,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567890'
      }
    ]
  },
  {
    id: '2',
    email: 'pro.user@example.com',
    name: 'Anna Schmidt',
    plan: 'Pro',
    credits: 8500,
    joinDate: '2024-01-10',
    lastActive: '2024-01-20',
    totalSpent: 29,
    isBlocked: false,
    isFree: false,
    subscriptionStatus: 'cancelled',
    cancelledAt: '2024-01-18',
    cancelledEffectiveDate: '2024-01-31',
    cancellationReason: 'Zu teuer',
    paymentMethod: {
      type: 'mastercard',
      last4: '8888',
      expiryMonth: 8,
      expiryYear: 2027
    },
    billingAddress: {
      name: 'Anna Schmidt',
      street: 'Bahnhofstrasse 45',
      city: 'Bern',
      postalCode: '3011',
      country: 'Schweiz'
    },
    transactions: [
      {
        id: 'TXN-1705847123',
        date: '2024-01-15T10:30:00Z',
        description: 'Upgrade: Starter → Pro',
        amount: 29,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567891'
      },
      {
        id: 'TXN-1705847124',
        date: '2024-01-10T14:20:00Z',
        description: 'Starter Paket - Monatlich',
        amount: 0,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567892'
      }
    ]
  },
  {
    id: '3',
    email: 'builder@example.com',
    name: 'Thomas Weber',
    plan: 'Builder',
    credits: 45000,
    joinDate: '2024-01-05',
    lastActive: '2024-01-20',
    totalSpent: 99,
    isBlocked: false,
    isFree: true,
    freeUntil: '2024-03-05',
    subscriptionStatus: 'active',
    cancelledAt: null,
    cancelledEffectiveDate: null,
    cancellationReason: null,
    paymentMethod: {
      type: 'amex',
      last4: '1005',
      expiryMonth: 3,
      expiryYear: 2028
    },
    billingAddress: {
      name: 'Thomas Weber',
      street: 'Seestrasse 78',
      city: 'Luzern',
      postalCode: '6003',
      country: 'Schweiz'
    },
    transactions: [
      {
        id: 'TXN-1705847456',
        date: '2024-01-16T14:20:00Z',
        description: 'Upgrade: Pro → Builder',
        amount: 70,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567893'
      },
      {
        id: 'TXN-1705847457',
        date: '2024-01-05T09:15:00Z',
        description: 'Pro Paket - Monatlich',
        amount: 29,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567894'
      }
    ]
  },
  {
    id: '4',
    email: 'startup@example.com',
    name: 'Lisa Müller',
    plan: 'Pro',
    credits: 6200,
    joinDate: '2024-01-12',
    lastActive: '2024-01-19',
    totalSpent: 29,
    isBlocked: true,
    isFree: false,
    subscriptionStatus: 'cancelled',
    cancelledAt: '2024-01-15',
    cancelledEffectiveDate: '2024-01-31',
    cancellationReason: 'Nutze es nicht mehr',
    paymentMethod: {
      type: 'visa',
      last4: '5555',
      expiryMonth: 11,
      expiryYear: 2025
    },
    billingAddress: {
      name: 'Lisa Müller',
      street: 'Hauptstrasse 12',
      city: 'Basel',
      postalCode: '4051',
      country: 'Schweiz'
    },
    transactions: [
      {
        id: 'TXN-1705847789',
        date: '2024-01-17T09:15:00Z',
        description: 'Upgrade: Starter → Pro',
        amount: 29,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567895'
      },
      {
        id: 'TXN-1705847790',
        date: '2024-01-12T11:30:00Z',
        description: 'Starter Paket - Monatlich',
        amount: 0,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567896'
      }
    ]
  },
  {
    id: '5',
    email: 'agency@example.com',
    name: 'Michael Bauer',
    plan: 'Builder',
    credits: 38000,
    joinDate: '2024-01-08',
    lastActive: '2024-01-20',
    totalSpent: 99,
    isBlocked: false,
    isFree: false,
    subscriptionStatus: 'active',
    cancelledAt: null,
    cancelledEffectiveDate: null,
    cancellationReason: null,
    paymentMethod: {
      type: 'mastercard',
      last4: '7777',
      expiryMonth: 6,
      expiryYear: 2026
    },
    billingAddress: {
      name: 'Michael Bauer',
      street: 'Industriestrasse 99',
      city: 'St. Gallen',
      postalCode: '9000',
      country: 'Schweiz'
    },
    transactions: [
      {
        id: 'TXN-1705848890',
        date: '2024-01-21T13:10:00Z',
        description: 'Builder Paket - Monatlich',
        amount: 99,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567897'
      },
      {
        id: 'TXN-1705848891',
        date: '2024-01-08T10:00:00Z',
        description: 'Starter Paket - Monatlich',
        amount: 0,
        status: 'completed',
        stripeId: 'pi_3OaBC1234567898'
      }
    ]
  }
];

export const adminRevenueStats = {
  monthlyRevenue: 257,
  activeSubscriptions: 4,
  churnRate: 8.5,
  averageRevenuePerUser: 51.4,
  totalRevenue: 257,
  revenueGrowth: 12.3,
  newSubscriptions: 3,
  cancelledSubscriptions: 1,
  // Neue Felder für Rückerstattungen
  totalRefunds: 0,
  pendingRefunds: 0,
  refundCount: 0,
  netRevenue: 257 // totalRevenue - totalRefunds
};

// Preise für Pakete (für Rückerstattungsberechnung)
export const planPrices = {
  Free: 0,
  Starter: 0,
  Pro: 29,
  Builder: 99
};
