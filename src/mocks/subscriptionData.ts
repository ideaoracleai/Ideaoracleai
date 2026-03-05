
export const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 39.90, // Basis-Preis in CHF
    basePriceCHF: 39.90,
    credits: 2500,
    features: [
      'Freier Chat (kein Formular)',
      'Marktlogik & ehrliche Bewertung',
      'Persistenter Chat-Verlauf',
      'Mehrere parallele Chat-Sessions',
      'Vollständig mehrsprachig',
      'Credit-basierte Nutzung',
      'Monatlicher Reset'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59.90,
    basePriceCHF: 59.90,
    credits: 5000,
    features: [
      'Freier Chat (kein Formular)',
      'Marktlogik & ehrliche Bewertung',
      'Persistenter Chat-Verlauf',
      'Mehrere parallele Chat-Sessions',
      'Vollständig mehrsprachig',
      'Credit-basierte Nutzung',
      'Monatlicher Reset',
      'Erweiterte Statistiken'
    ]
  },
  {
    id: 'builder',
    name: 'Builder',
    price: 199,
    basePriceCHF: 199,
    credits: -1,
    features: [
      'Freier Chat (kein Formular)',
      'Marktlogik & ehrliche Bewertung',
      'Persistenter Chat-Verlauf',
      'Mehrere parallele Chat-Sessions',
      'Vollständig mehrsprachig',
      'Builder-Modus: Entwickler-Briefings',
      'Strukturierte Zusammenfassung',
      'Unlimited Credits (Fair-Use)'
    ]
  }
];

export const savedCards = [
  {
    id: 'card_1',
    type: 'Visa',
    last4: '4242',
    expiry: '12/26',
    holderName: 'Max Mustermann',
    isDefault: true
  },
  {
    id: 'card_2',
    type: 'Mastercard',
    last4: '8888',
    expiry: '08/27',
    holderName: 'Max Mustermann',
    isDefault: false
  }
];

export const paymentHistory = [
  {
    id: 'inv_001',
    date: '01. Jan 2025',
    dateRaw: '2025-01-01',
    amount: 59.90,
    tax: 4.61,
    status: 'bezahlt',
    description: 'Pro Plan - Monatlich',
    invoice: 'INV-2025-001',
    plan: 'Pro'
  },
  {
    id: 'inv_002',
    date: '01. Dez 2024',
    dateRaw: '2024-12-01',
    amount: 59.90,
    tax: 4.61,
    status: 'bezahlt',
    description: 'Pro Plan - Monatlich',
    invoice: 'INV-2024-012',
    plan: 'Pro'
  },
  {
    id: 'inv_003',
    date: '01. Nov 2024',
    dateRaw: '2024-11-01',
    amount: 59.90,
    tax: 4.61,
    status: 'bezahlt',
    description: 'Pro Plan - Monatlich',
    invoice: 'INV-2024-011',
    plan: 'Pro'
  },
  {
    id: 'inv_004',
    date: '01. Okt 2024',
    dateRaw: '2024-10-01',
    amount: 39.90,
    tax: 3.07,
    status: 'bezahlt',
    description: 'Starter Plan - Monatlich',
    invoice: 'INV-2024-010',
    plan: 'Starter'
  },
  {
    id: 'inv_005',
    date: '01. Sep 2024',
    dateRaw: '2024-09-01',
    amount: 39.90,
    tax: 3.07,
    status: 'bezahlt',
    description: 'Starter Plan - Monatlich',
    invoice: 'INV-2024-009',
    plan: 'Starter'
  },
  {
    id: 'inv_006',
    date: '01. Aug 2024',
    dateRaw: '2024-08-01',
    amount: 39.90,
    tax: 3.07,
    status: 'bezahlt',
    description: 'Starter Plan - Monatlich',
    invoice: 'INV-2024-008',
    plan: 'Starter'
  }
];

export const currentSubscription = {
  planId: 'pro',
  plan: 'Pro',
  price: 59.90,
  basePriceCHF: 59.90,
  status: 'aktiv',
  nextBilling: '01. Februar 2025',
  startDate: '01. Oktober 2024',
  credits: 5000,
  creditsUsed: 1830
};

export const billingAddress = {
  name: 'Max Mustermann',
  company: 'Startup GmbH',
  street: 'Musterstra\u00dfe 123',
  city: 'Z\u00fcrich',
  zip: '8001',
  country: 'Schweiz',
  vatId: 'CHE-123.456.789'
};

export const companyInfo = {
  name: 'IdeaOracle.ai',
  street: 'Musterstra\u00dfe 123',
  zip: '8000',
  city: 'Z\u00fcrich',
  country: 'Schweiz',
  email: 'billing@ideaoracle.ai',
  vatId: 'CHE-987.654.321',
  website: 'https://ideaoracle.ai'
};
