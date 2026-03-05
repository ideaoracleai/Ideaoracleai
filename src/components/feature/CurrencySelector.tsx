
import { useState, useEffect } from 'react';
import { useCurrency, CURRENCIES, CurrencyCode } from '../../hooks/useCurrency';

interface CurrencySelectorProps {
  variant?: 'default' | 'compact' | 'minimal';
  showExchangeInfo?: boolean;
}

const CURRENCY_ICONS: Record<CurrencyCode, string> = {
  CHF: 'ri-money-cny-circle-line',
  EUR: 'ri-money-euro-circle-line',
  USD: 'ri-money-dollar-circle-line',
  GBP: 'ri-money-pound-circle-line',
};

export default function CurrencySelector({ 
  variant = 'default',
  showExchangeInfo = true 
}: CurrencySelectorProps) {
  const { currency, setCurrency, getExchangeInfo } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const exchangeInfo = getExchangeInfo();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.currency-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'minimal') {
    return (
      <div className="currency-selector flex items-center gap-1">
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code)}
            className={`px-2 py-1 text-xs font-medium rounded transition-all cursor-pointer whitespace-nowrap ${
              currency.code === c.code
                ? 'bg-[#C9A961]/20 text-[#C9A961]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {c.code}
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="currency-selector relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1A1F26] hover:bg-[#252B3B] transition-colors border border-[#3D3428]/30 cursor-pointer"
        >
          <span className="text-sm font-medium text-white">{currency.code}</span>
          <i className={`ri-arrow-down-s-line text-gray-400 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-44 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg shadow-xl z-50">
            <div className="p-1">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c.code); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    currency.code === c.code
                      ? 'bg-[#C9A961]/10 text-[#C9A961]'
                      : 'text-gray-300 hover:bg-[#252B3B]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <i className={`${CURRENCY_ICONS[c.code]} text-base`}></i>
                    <span className="text-sm">{c.code}</span>
                  </div>
                  {currency.code === c.code && (
                    <i className="ri-check-line text-[#C9A961]"></i>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="currency-selector relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1F26] hover:bg-[#252B3B] transition-colors border border-[#3D3428]/30 cursor-pointer"
      >
        <i className={`${CURRENCY_ICONS[currency.code]} text-lg text-gray-400`}></i>
        <span className="text-sm text-gray-300">{currency.code}</span>
        <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg shadow-xl z-50">
          <div className="p-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  currency.code === c.code
                    ? 'bg-[#C9A961]/10 text-[#C9A961]'
                    : 'text-gray-300 hover:bg-[#252B3B]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <i className={`${CURRENCY_ICONS[c.code]} text-lg`}></i>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{c.code}</span>
                    <span className="text-xs text-gray-500">{c.name}</span>
                  </div>
                </div>
                {currency.code === c.code && (
                  <i className="ri-check-line text-[#C9A961]"></i>
                )}
              </button>
            ))}
          </div>
          
          {showExchangeInfo && exchangeInfo && (
            <div className="border-t border-[#3D3428]/30 p-3">
              <div className="flex items-start gap-2">
                <i className="ri-information-line text-[#C9A961] text-sm mt-0.5"></i>
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    Aktueller Kurs: <span className="text-white font-medium">{exchangeInfo.note}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {exchangeInfo.billingNote}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
