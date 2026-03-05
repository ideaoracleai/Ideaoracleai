
import { useState, useEffect, useCallback } from 'react';

export type CurrencyCode = 'CHF' | 'EUR' | 'USD' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'CHF', symbol: 'CHF', name: 'Schweizer Franken' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US-Dollar' },
  { code: 'GBP', symbol: '£', name: 'Britisches Pfund' },
];

// Basis-Wechselkurse (reale Kurse ca.)
// CHF ist die Hauptwährung - alle Kurse sind CHF -> Fremdwährung
const EXCHANGE_RATES: Record<CurrencyCode, { baseRate: number; profitMargin: number }> = {
  CHF: { baseRate: 1, profitMargin: 0 },
  EUR: { baseRate: 0.92, profitMargin: 0.05 },    // Real ~0.92, wir zeigen ~0.874 (5% Gewinn)
  USD: { baseRate: 1.12, profitMargin: 0.05 },    // Real ~1.12, wir zeigen ~1.064 (5% Gewinn)
  GBP: { baseRate: 0.79, profitMargin: 0.06 },    // Real ~0.79, wir zeigen ~0.743 (6% Gewinn)
};

// Berechne den Anzeige-Kurs mit Gewinn-Marge
function getDisplayRate(code: CurrencyCode): number {
  const { baseRate, profitMargin } = EXCHANGE_RATES[code];
  return baseRate * (1 - profitMargin);
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<CurrencyConfig>(() => {
    const saved = localStorage.getItem('selectedCurrency');
    if (saved) {
      const found = CURRENCIES.find(c => c.code === saved);
      if (found) return found;
    }
    return CURRENCIES[0]; // CHF als Standard
  });

  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency.code);
    // Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: currency }));
  }, [currency]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) setCurrencyState(found);
  }, []);

  // CHF zu Anzeige-Währung konvertieren
  const convertFromCHF = useCallback((amountCHF: number): number => {
    if (currency.code === 'CHF') return amountCHF;
    return amountCHF * getDisplayRate(currency.code);
  }, [currency.code]);

  // Anzeige-Währung zu CHF konvertieren (für Abrechnung)
  const convertToCHF = useCallback((amount: number): number => {
    if (currency.code === 'CHF') return amount;
    return amount / getDisplayRate(currency.code);
  }, [currency.code]);

  // Formatierte Preisanzeige
  const formatPrice = useCallback((amountCHF: number, showCurrency = true): string => {
    const converted = convertFromCHF(amountCHF);
    const formatted = converted.toFixed(2);
    
    if (!showCurrency) return formatted;
    
    const currencySymbol = CURRENCIES.find(c => c.code === currency.code)?.symbol || currency.code;
    
    if (currency.code === 'CHF') {
      return `CHF ${formatted}`;
    }
    return `${currencySymbol} ${formatted}`;
  }, [currency.code, convertFromCHF]);

  // Kurs-Info für Anzeige
  const getExchangeInfo = useCallback(() => {
    if (currency.code === 'CHF') return null;
    
    const { baseRate, profitMargin } = EXCHANGE_RATES[currency.code];
    const displayRate = getDisplayRate(currency.code);
    const currencySymbol = CURRENCIES.find(c => c.code === currency.code)?.symbol || currency.code;
    
    return {
      displayRate: displayRate.toFixed(4),
      baseRate: baseRate.toFixed(4),
      profitMargin: `${(profitMargin * 100).toFixed(0)}%`,
      note: `1 CHF = ${displayRate.toFixed(2)} ${currencySymbol}`,
      billingNote: 'Abrechnung erfolgt in CHF'
    };
  }, [currency.code]);

  return {
    currency,
    currencies: CURRENCIES,
    setCurrency,
    convertFromCHF,
    convertToCHF,
    formatPrice,
    getExchangeInfo,
    isEUR: currency.code === 'EUR',
    isCHF: currency.code === 'CHF',
    isUSD: currency.code === 'USD',
    isGBP: currency.code === 'GBP',
    isForeignCurrency: currency.code !== 'CHF',
  };
}

// Globaler Zugriff für Komponenten ohne Hook
export function getCurrencyFromStorage(): CurrencyConfig {
  const saved = localStorage.getItem('selectedCurrency');
  if (saved) {
    const found = CURRENCIES.find(c => c.code === saved);
    if (found) return found;
  }
  return CURRENCIES[0];
}
