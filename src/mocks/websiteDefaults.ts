export const defaultHeroData = {
  badge: "Entscheidungs-KI für Geschäfts-Nischen",
  title1: "Nicht jede Idee ist gut.",
  title2: "Wir sagen dir ehrlich, welche es ist.",
  subtitle: "Eine Entscheidungs-KI für Geschäfts-Nischen.",
  subtitleLine2: "Klar. Kritisch. Ohne Schönreden.",
  ctaPrimary: "Idee prüfen",
  ctaSecondary: "Wie es funktioniert",
  stat1Value: "30",
  stat1Label: "Credits pro Anfrage",
  stat2Value: "3",
  stat2Label: "Bewertungsstufen",
  stat3Value: "100%",
  stat3Label: "Ehrlich & Privat"
};

export const defaultPricingData = {
  title: "Preise",
  subtitle: "Wähle das Paket, das zu deiner Prüftiefe passt.",
  plans: [
    {
      id: "starter",
      name: "Starter",
      price: "39.90",
      description: "Zugriff auf den KI-Nischen-Chatbot",
      credits: "2‑500 Credits pro Monat",
      features: [
        "Freier Chat (kein Formular)",
        "Marktlogik & ehrliche Bewertung",
        "Persistenter Chat-Verlauf",
        "Mehrere parallele Chat-Sessions",
        "Vollständig mehrsprachig",
        "Credit-basierte Nutzung",
        "Monatlicher Reset",
        "Marktanalyse",
        "Zusammenfassung",
        "Stärken",
        "Schwächen",
        "Chancen",
        "Risiken",
        "Empfehlungen",
        "PDF Herunterladen",
        "Keine Entwickler-Briefings",
        "Strukturierte Zusammenfassung"
      ],
      negativeFeatures: [15, 16],
      highlighted: false
    },
    {
      id: "pro",
      name: "Pro",
      price: "59.90",
      description: "Zugriff auf den KI-Nischen-Chatbot",
      credits: "5‑9000 Credits pro Monat",
      features: [
        "Freier Chat (kein Formular)",
        "Marktlogik & ehrliche Bewertung",
        "Persistenter Chat-Verlauf",
        "Mehrere parallele Chat-Sessions",
        "Vollständig mehrsprachig",
        "Credit-basierte Nutzung",
        "Monatlicher Reset",
        "Marktanalyse",
        "Zusammenfassung",
        "Stärken",
        "Schwächen",
        "Chancen",
        "Risiken",
        "Empfehlungen",
        "PDF Herunterladen",
        "Keine Entwickler-Briefings",
        "Strukturierte Zusammenfassung"
      ],
      negativeFeatures: [15, 16],
      highlighted: true
    },
    {
      id: "builder",
      name: "Builder",
      price: "199",
      description: "Alle Funktionen + Builder-Modus",
      credits: "Unlimited Credits",
      features: [
        "Freier Chat (kein Formular)",
        "Marktlogik & ehrliche Bewertung",
        "Persistenter Chat-Verlauf",
        "Mehrere parallele Chat-Sessions",
        "Vollständig mehrsprachig",
        "Credit-basierte Nutzung",
        "Monatlicher Reset",
        "Marktanalyse",
        "Zusammenfassung",
        "Stärken",
        "Schwächen",
        "Chancen",
        "Risiken",
        "Empfehlungen",
        "PDF Herunterladen",
        "Builder-Modus: Entwickler-Briefings",
        "Strukturierte Zusammenfassung"
      ],
      negativeFeatures: [],
      specialFeatures: [15, 16],
      highlighted: false
    }
  ]
};

export const defaultFaqData = [
  {
    question: "Was macht IdeaOracle genau?",
    answer: "IdeaOracle validiert deine Geschäftsidee. Keine Inspiration. Keine Motivation. Nur eine ehrliche Einschätzung, ob deine Idee Potenzial hat oder nicht."
  },
  {
    question: "Ist das besser als ChatGPT?",
    answer: "Ja. ChatGPT ist darauf trainiert, nett zu sein. IdeaOracle ist darauf trainiert, ehrlich zu sein. Große Unterschied."
  },
  {
    question: "Redet die KI meine Idee schön?",
    answer: "Nein. Wenn deine Idee schlecht ist, sagen wir das. Wenn sie gut ist, auch. Ohne Filter."
  },
  {
    question: "Gibt es eine Erfolgsgarantie?",
    answer: "Nein. Wir garantieren nur eins: Klarheit. Was du daraus machst, liegt bei dir."
  },
  {
    question: "Sind meine Ideen privat?",
    answer: "Ja. Vollständig. Wir speichern nichts für Training, teilen nichts mit Dritten. Deine Ideen gehören dir."
  },
  {
    question: "Warum kostet jede Frage 30 Credits?",
    answer: "Weil gute Analysen Ressourcen kosten. Und weil Denken wertvoll ist. Billig gibt's woanders."
  },
  {
    question: "Was unterscheidet euch von anderen Tools?",
    answer: "Wir verkaufen keine Hoffnung. Wir liefern Fakten. Andere Tools wollen, dass du dich gut fühlst. Wir wollen, dass du kluge Entscheidungen triffst."
  },
  {
    question: "Kann ich mein Abo jederzeit kündigen?",
    answer: "Ja. Keine Tricks, keine versteckten Klauseln. Kündigen zum Monatsende – fertig."
  },
  {
    question: "Was ist der Builder-Modus?",
    answer: "Im Builder-Paket bekommst du strukturierte Entwickler-Briefings. Perfekt, wenn du deine validierte Idee direkt umsetzen willst."
  },
  {
    question: "Gibt es eine Geld-zurück-Garantie?",
    answer: "Nein. Aber du kannst kostenlos testen, bevor du zahlst. Wenn dir nicht gefällt, was du siehst – kauf einfach nicht."
  }
];

export const defaultSeoData = {
  title: "IdeaOracle.ai - AI-Powered Idea Validation Platform",
  description:
    "IdeaOracle.ai uses advanced AI to validate your business ideas, provide honest feedback, and help you make informed decisions. Get brutally honest insights in seconds.",
  keywords:
    "idea validation, AI feedback, business ideas, startup validation, IdeaOracle.ai",
  ogTitle: "IdeaOracle.ai - AI-Powered Idea Validation",
  ogDescription: "Get brutally honest AI feedback on your business ideas in seconds",
  ogUrl: "https://ideaoracle.ai/",
  twitterTitle: "IdeaOracle.ai - AI-Powered Idea Validation",
  twitterDescription: "Get brutally honest AI feedback on your business ideas in seconds"
};

export const defaultLegalData = {
  privacy: {
    title: "Datenschutzerklärung",
    lastUpdated: "15. Januar 2024",
    sections: [
      {
        title: "1. Verantwortlicher",
        content:
          "Verantwortlich für die Datenverarbeitung auf dieser Website ist IdeaOracle.ai, Zürich, Schweiz. Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst und behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften."
      },
      {
        title: "2. Erhobene Daten",
        content:
          "Wir erheben und verarbeiten folgende personenbezogene Daten:\n• Registrierungsdaten: Name, E-Mail-Adresse, Passwort (verschlüsselt)\n• Nutzungsdaten: IP-Adresse, Browsertyp, Zugriffszeiten\n• Geschäftsideen und Nischen-Anfragen (anonymisiert gespeichert)\n• Zahlungsinformationen (über sichere Drittanbieter)"
      },
      {
        title: "3. Zweck der Datenverarbeitung",
        content:
          "Ihre Daten werden für folgende Zwecke verwendet:\n• Bereitstellung und Verbesserung unserer KI-Dienste\n• Kontoverwaltung und Authentifizierung\n• Abrechnung und Zahlungsabwicklung"
      },
      {
        title: "4. Datensicherheit",
        content:
          "Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen Manipulation, Verlust, Zerstörung oder unbefugten Zugriff zu schützen. Alle Datenübertragungen erfolgen verschlüsselt über SSL/TLS."
      },
      {
        title: "5. Vertraulichkeit Ihrer Geschäftsideen",
        content:
          "Ihre eingegebenen Geschäftsideen und Nischen-Anfragen werden streng vertraulich behandelt. Sie werden nicht an Dritte weitergegeben, nicht für Trainingszwecke verwendet und können auf Wunsch vollständig gelöscht werden."
      },
      {
        title: "6. Ihre Rechte",
        content:
          "Sie haben folgende Rechte:\n• Recht auf Auskunft über gespeicherte Daten\n• Recht auf Berichtigung unrichtiger Daten\n• Recht auf Löschung Ihrer Daten\n• Recht auf Datenübertragbarkeit"
      },
      {
        title: "7. Cookies",
        content:
          "Unsere Website verwendet nur technisch notwendige Cookies für die Authentifizierung und Sitzungsverwaltung. Wir verwenden keine Tracking-Cookies oder Analyse-Tools von Drittanbietern ohne Ihre ausdrückliche Zustimmung."
      },
      {
        title: "8. Änderungen",
        content:
          "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslagen oder bei Änderungen des Dienstes anzupassen."
      }
    ],
    contactEmail: "privacy@ideaoracle.ai",
    contactAddress: "Zürich, Schweiz"
  },
  terms: {
    title: "Allgemeine Geschäftsbedingungen",
    lastUpdated: "15. Januar 2024",
    sections: [
      {
        title: "1. Geltungsbereich",
        content:
          "Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen IdeaOracle.ai (nachfolgend \"Anbieter\") und dem Nutzer (nachfolgend \"Kunde\") über die Nutzung der KI-gestützten Nischen-Analyse-Plattform."
      },
      {
        title: "2. Leistungsbeschreibung",
        content:
          "Der Anbieter stellt eine KI-basierte Plattform zur Verfügung, die Geschäftsideen und Nischen analysiert und bewertet:\n• KI-gestützte Analyse von Geschäftsideen\n• Bewertung von Marktpotenzial und Wettbewerb\n• Generierung von Nischen-Vorschlägen\n• Erstellung von Entwickler-Briefings (Builder-Paket)"
      },
      {
        title: "3. Vertragsschluss und Registrierung",
        content:
          "Der Vertrag kommt durch die Registrierung auf der Plattform und die Auswahl eines Pakets zustande. Der Kunde versichert:\n• Volljährigkeit und volle Geschäftsfähigkeit\n• Wahrheitsgemäße Angaben bei der Registrierung\n• Sichere Aufbewahrung der Zugangsdaten"
      },
      {
        title: "4. Credits und Abrechnung",
        content:
          "Die Nutzung der KI-Funktionen erfolgt über ein Credit-System. Jede KI-Anfrage kostet 30 Credits. Credits werden nur bei erfolgreicher Antwort abgezogen. Nicht genutzte Credits verfallen am Ende des Abrechnungszeitraums."
      },
      {
        title: "5. Haftungsausschluss",
        content:
          "Die KI-Bewertungen dienen ausschließlich als Entscheidungshilfe und stellen keine Garantie für geschäftlichen Erfolg dar. Der Anbieter haftet nicht für Entscheidungen, die auf Basis der KI-Analysen getroffen werden."
      },
      {
        title: "6. Datenschutz und Vertraulichkeit",
        content:
          "Alle eingegebenen Geschäftsideen werden vertraulich behandelt und nicht an Dritte weitergegeben. Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung."
      },
      {
        title: "7. Kündigung",
        content:
          "Der Kunde kann sein Abonnement jederzeit zum Ende des aktuellen Abrechnungszeitraums kündigen. Bei Verstößen gegen diese AGB behält sich der Anbieter das Recht vor, den Zugang zu sperren."
      },
      {
        title: "8. Schlussbestimmungen",
        content:
          "Es gilt Schweizer Recht. Gerichtsstand ist Zürich, Schweiz. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt."
      }
    ],
    contactEmail: "legal@ideaoracle.ai",
    contactAddress: "Zürich, Schweiz"
  },
  imprint: {
    title: "Impressum",
    lastUpdated: "15. Januar 2024",
    sections: [
      {
        title: "Angaben gemäß § 5 TMG",
        content:
          "IdeaOracle.ai\nMusterstraße 123\n8000 Zürich\nSchweiz"
      },
      {
        title: "Kontakt",
        content:
          "E-Mail: info@ideaoracle.ai\nTelefon: +41 44 123 45 67"
      },
      {
        title: "Verantwortlich für den Inhalt",
        content:
          "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:\nMax Mustermann\nMusterstraße 123\n8000 Zürich, Schweiz"
      },
      {
        title: "Haftungsausschluss",
        content:
          "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich."
      },
      {
        title: "Haftung für Links",
        content:
          "Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich."
      },
      {
        title: "Urheberrecht",
        content:
          "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem Schweizer Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers."
      },
      {
        title: "Streitschlichtung",
        content:
          "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
      }
    ],
    contactEmail: "info@ideaoracle.ai",
    contactAddress: "Musterstraße 123, 8000 Zürich, Schweiz"
  }
};

export const defaultFooterData = {
  description: "Eine Entscheidungs-KI für Geschäfts-Nischen. Klar. Kritisch. Ohne Schönreden.",
  columns: {
    product: {
      title: "Produkt",
      links: [
        { label: "Features", url: "/#features" },
        { label: "Preise", url: "/#pricing" },
        { label: "FAQ", url: "/#faq" },
        { label: "Kostenlos testen", url: "/trial" }
      ]
    },
    legal: {
      title: "Rechtliches",
      links: [
        { label: "Datenschutz", url: "/privacy" },
        { label: "AGB", url: "/terms" },
        { label: "Impressum", url: "/imprint" }
      ]
    },
    support: {
      title: "Support",
      links: [
        { label: "Kontakt", url: "mailto:support@ideaoracle.ai" },
        { label: "Dokumentation", url: "/#how-it-works" },
        { label: "Status", url: "https://status.ideaoracle.ai" }
      ]
    }
  },
  copyright: "© 2024 IdeaOracle.ai. Alle Rechte vorbehalten.",
  readyLink: {
    text: "Website Builder",
    url: "https://readdy.ai/?ref=logo"
  }
};

// Navbar Defaults
export const defaultNavbarData = {
  logoText: "IdeaOracle",
  logoAccent: ".ai",
  slogan: "Entscheidungs-KI",
  logoIcon: "ri-compass-3-line",
  links: [
    { label: "Features", target: "features" },
    { label: "So funktioniert's", target: "how-it-works" },
    { label: "Preise", target: "pricing" },
    { label: "FAQ", target: "faq" }
  ],
  ctaText: "Jetzt starten",
  ctaUrl: "/auth"
};

// Features Defaults
export const defaultFeaturesData = {
  title1: "Warum",
  title2: "IdeaOracle",
  title3: "wählen?",
  mainFeature: {
    title: "Tiefgehende Marktanalyse",
    description: "Unsere KI analysiert Markttrends, Wettbewerber und Potenziale in Echtzeit für fundierte Entscheidungen.",
    image: "https://readdy.ai/api/search-image?query=advanced%20business%20intelligence%20platform%20interface%20with%20data%20analytics%20charts%20and%20graphs%2C%20modern%20corporate%20technology%2C%20clean%20white%20background%2C%20professional%20dashboard%20design%2C%20minimalist%20aesthetic%2C%20soft%20lighting%2C%20contemporary%20digital%20workspace%2C%20high%20quality%20visualization%2C%20neutral%20tones&width=700&height=900&seq=feature1&orientation=portrait"
  },
  features: [
    {
      title: "Team-Kollaboration",
      description: "Arbeite nahtlos mit deinem Team zusammen und teile Erkenntnisse in Echtzeit.",
      icon: "ri-team-line",
      bgColor: "#7BA882"
    },
    {
      title: "Datensicherheit",
      description: "Deine Geschäftsideen sind bei uns sicher – verschlüsselt und privat.",
      icon: "ri-shield-check-line",
      bgColor: "#D4A5A5"
    }
  ]
};

// How It Works Defaults
export const defaultHowItWorksData = {
  title: "So funktioniert's",
  subtitle: "In 4 einfachen Schritten zur Klarheit über deine Geschäftsidee",
  steps: [
    {
      number: "01",
      title: "Paket wählen",
      description: "Wähle das passende Paket für deine Bedürfnisse und starte sofort.",
      icon: "ri-shopping-bag-3-line"
    },
    {
      number: "02",
      title: "Idee beschreiben",
      description: "Beschreibe deine Geschäftsidee oder Nische im Chat – so detailliert wie du möchtest.",
      icon: "ri-question-answer-line"
    },
    {
      number: "03",
      title: "KI-Analyse erhalten",
      description: "Unsere KI analysiert deine Idee kritisch und ehrlich – ohne Schönreden.",
      icon: "ri-shield-check-line"
    },
    {
      number: "04",
      title: "Entscheidung treffen",
      description: "Nutze die Erkenntnisse für fundierte Entscheidungen über deine nächsten Schritte.",
      icon: "ri-checkbox-circle-line"
    }
  ]
};

// Testimonials Defaults
export const defaultTestimonialsData = {
  badge: "Kundenstimmen",
  title: "Was unsere Kunden sagen",
  subtitle: "Erfahre, wie IdeaOracle anderen geholfen hat",
  testimonials: [
    {
      stars: 5,
      title: "Endlich ehrliches Feedback",
      review: "IdeaOracle hat mir geholfen, meine Geschäftsidee kritisch zu hinterfragen. Die KI war brutal ehrlich – genau das, was ich brauchte.",
      name: "Sarah Müller",
      role: "Gründerin, TechStart",
      avatar: "https://readdy.ai/api/search-image?query=professional%20business%20woman%20portrait%20headshot%2C%20confident%20female%20executive%2C%20clean%20white%20background%2C%20corporate%20photography%2C%20natural%20lighting%2C%20friendly%20smile%2C%20professional%20attire%2C%20high%20quality%20portrait&width=100&height=100&seq=avatar1&orientation=squarish"
    },
    {
      stars: 5,
      title: "Zeit und Geld gespart",
      review: "Bevor ich IdeaOracle nutzte, hätte ich fast in eine schlechte Idee investiert. Die Analyse hat mir tausende Euro erspart.",
      name: "Michael Weber",
      role: "Unternehmer",
      avatar: "https://readdy.ai/api/search-image?query=professional%20business%20man%20portrait%20headshot%2C%20confident%20male%20executive%2C%20clean%20white%20background%2C%20corporate%20photography%2C%20natural%20lighting%2C%20friendly%20expression%2C%20business%20suit%2C%20high%20quality%20portrait&width=100&height=100&seq=avatar2&orientation=squarish"
    },
    {
      stars: 5,
      title: "Beste Investition",
      review: "Die Builder-Funktion mit den Entwickler-Briefings ist Gold wert. Endlich kann ich meine validierten Ideen direkt umsetzen.",
      name: "Lisa Schmidt",
      role: "Produktmanagerin",
      avatar: "https://readdy.ai/api/search-image?query=professional%20business%20woman%20portrait%20headshot%2C%20confident%20female%20leader%2C%20clean%20white%20background%2C%20corporate%20photography%2C%20natural%20lighting%2C%20warm%20smile%2C%20professional%20clothing%2C%20high%20quality%20portrait&width=100&height=100&seq=avatar3&orientation=squarish"
    },
    {
      stars: 5,
      title: "Klare Empfehlung",
      review: "Ich nutze IdeaOracle für jede neue Geschäftsidee. Die Analyse ist schnell, präzise und vor allem ehrlich.",
      name: "Thomas Bauer",
      role: "Serial Entrepreneur",
      avatar: "https://readdy.ai/api/search-image?query=professional%20business%20man%20portrait%20headshot%2C%20confident%20male%20professional%2C%20clean%20white%20background%2C%20corporate%20photography%2C%20natural%20lighting%2C%20approachable%20smile%2C%20business%20attire%2C%20high%20quality%20portrait&width=100&height=100&seq=avatar4&orientation=squarish"
    },
    {
      stars: 5,
      title: "Perfekt für Startups",
      review: "Als Startup-Gründerin brauche ich schnelle, ehrliche Einschätzungen. IdeaOracle liefert genau das.",
      name: "Anna Hoffmann",
      role: "Startup-Gründerin",
      avatar: "https://readdy.ai/api/search-image?query=professional%20business%20woman%20portrait%20headshot%2C%20confident%20female%20entrepreneur%2C%20clean%20white%20background%2C%20corporate%20photography%2C%20natural%20lighting%2C%20confident%20expression%2C%20modern%20professional%20attire%2C%20high%20quality%20portrait&width=100&height=100&seq=avatar5&orientation=squarish"
    },
    {
      stars: 5,
      title: "Unverzichtbar",
      review: "Die KI-Analyse hat mir geholfen, meine Nische zu verfeinern und den perfekten Markt zu finden.",
      name: "Robert Klein",
      role: "Berater",
      avatar: "https://readdy.ai/api/search-image?query=professional%20business%20man%20portrait%20headshot%2C%20confident%20male%20executive%2C%20clean%20white%20background%2C%20corporate%20photography%2C%20natural%20lighting%2C%20professional%20smile%2C%20business%20suit%2C%20high%20quality%20portrait&width=100&height=100&seq=avatar6&orientation=squarish"
    }
  ]
};

// About Defaults
export const defaultAboutData = {
  badge: "Unsere Geschichte",
  title: "Die Zukunft der Geschäftsideen-Validierung",
  description: "Gegründet 2024, entstand IdeaOracle aus einer einfachen Vision: Unternehmern ehrliches, kritisches Feedback zu geben – ohne Schönreden. Heute helfen wir tausenden Gründern, fundierte Entscheidungen zu treffen.",
  testimonial: {
    quote: "IdeaOracle war entscheidend für unsere digitale Transformation. Die Plattform ist nicht nur ein Tool, sie ist ein Katalysator für Innovation.",
    name: "Alexandra Williams",
    role: "Chief Innovation Officer",
    avatar: "https://readdy.ai/api/search-image?query=professional%20business%20executive%20portrait%20headshot%2C%20confident%20corporate%20leader%2C%20clean%20white%20background%2C%20professional%20photography%2C%20natural%20lighting%2C%20warm%20smile%2C%20business%20attire%2C%20high%20quality%20portrait&width=100&height=100&seq=about1&orientation=squarish"
  }
};

// CTA Defaults
export const defaultCtaData = {
  title: "Bereit, deine Idee zu validieren?",
  subtitle: "Schließe dich tausenden Unternehmern an, die IdeaOracle nutzen, um fundierte Entscheidungen zu treffen.",
  buttonText: "Kostenlos starten",
  buttonUrl: "/trial"
};
