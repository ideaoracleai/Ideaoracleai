import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface TrialCoupon {
  id: string;
  code: string;
  category: 'trial';
  credits: number;
  duration: number;
  durationUnit: 'days' | 'months';
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

interface HeroData {
  badge: string;
  title1: string;
  title2: string;
  subtitle: string;
  subtitleLine2: string;
  ctaPrimary: string;
  ctaSecondary: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
}

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [suggestedCode, setSuggestedCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [customData, setCustomData] = useState<HeroData | null>(null);

  // Load custom hero data from localStorage (admin overrides)
  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_hero');
      if (saved) {
        try {
          setCustomData(JSON.parse(saved));
        } catch {
          // If parsing fails, just ignore and fallback to i18n
        }
      } else {
        setCustomData(null);
      }
    };

    loadData();

    // Listen for storage changes (when admin saves data)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website_hero') {
        loadData();
      }
    };

    // Listen for custom event (for same-tab updates)
    const handleCustomEvent = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  // Load the newest active trial coupon from localStorage - listen for changes
  useEffect(() => {
    const loadTrialCoupons = () => {
      const savedCoupons = localStorage.getItem('admin_trial_coupons');
      if (!savedCoupons) {
        setSuggestedCode('');
        setCouponCode('');
        return;
      }

      try {
        const coupons: TrialCoupon[] = JSON.parse(savedCoupons);
        const activeTestCoupons = coupons
          .filter(
            (c) =>
              c.isActive && new Date(c.expiresAt) > new Date()
          )
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

        if (activeTestCoupons.length > 0) {
          const latestCode = activeTestCoupons[0].code;
          setSuggestedCode(latestCode);
          setCouponCode(latestCode);
        } else {
          setSuggestedCode('');
          setCouponCode('');
        }
      } catch {
        // If something goes wrong, just skip the suggestion
      }
    };

    // Initial load
    loadTrialCoupons();

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_trial_coupons') {
        loadTrialCoupons();
      }
    };

    // Listen for custom event (for same-tab updates)
    const handleCustomEvent = () => {
      loadTrialCoupons();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('trial_coupons_updated', handleCustomEvent);

    // Poll for changes every second (for same-tab updates without custom events)
    const pollInterval = setInterval(loadTrialCoupons, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('trial_coupons_updated', handleCustomEvent);
      clearInterval(pollInterval);
    };
  }, []);

  /** Validate a coupon code against the stored trial coupons */
  const validateCoupon = (
    code: string
  ): { valid: boolean; error?: string; coupon?: TrialCoupon } => {
    const savedCoupons = localStorage.getItem('admin_trial_coupons');
    if (!savedCoupons) {
      return { valid: false, error: 'Kein gültiger Gutschein-Code' };
    }

    try {
      const coupons: TrialCoupon[] = JSON.parse(savedCoupons);
      const coupon = coupons.find(
        (c) => c.code.toLowerCase() === code.toLowerCase()
      );

      if (!coupon) {
        return { valid: false, error: 'Gutschein-Code nicht gefunden' };
      }

      if (!coupon.isActive) {
        return { valid: false, error: 'Dieser Gutschein ist nicht mehr aktiv' };
      }

      if (new Date(coupon.expiresAt) < new Date()) {
        return { valid: false, error: 'Dieser Gutschein ist abgelaufen' };
      }

      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
        return {
          valid: false,
          error: 'Dieser Gutschein wurde bereits zu oft eingelöst',
        };
      }

      return { valid: true, coupon };
    } catch {
      return { valid: false, error: 'Fehler bei der Validierung' };
    }
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!couponCode.trim()) {
      setError('Bitte gib einen Gutschein-Code ein');
      return;
    }

    setIsValidating(true);

    // Simulate async validation (e.g. server request)
    setTimeout(() => {
      const result = validateCoupon(couponCode.trim());
      setIsValidating(false);

      if (!result.valid) {
        setError(result.error || 'Ungültiger Gutschein-Code');
        return;
      }

      // Successful – navigate to the trial page with the code in the query string
      navigate(
        `/trial?code=${encodeURIComponent(couponCode.trim().toUpperCase())}`
      );
    }, 500);
  };

  // Helper: prefer custom admin data, otherwise fall back to i18n
  const getText = (key: string, customKey?: keyof HeroData) => {
    if (customData && customKey && customData[customKey]) {
      return customData[customKey];
    }
    return t(key);
  };

  return (
    <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A2F2A]/30 via-[#0F1419] to-[#0F1419]"></div>

      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#3D3428] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A961] rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center space-x-2 bg-[#1A1F26]/60 backdrop-blur-sm px-4 py-2 rounded-full border border-[#3D3428]/30">
            <div className="w-2 h-2 bg-[#C9A961] rounded-full animate-pulse"></div>
            <span className="text-[#C9A961] text-sm font-medium">
              {getText('hero.badge', 'badge')}
            </span>
          </div>

          <h1 className="space-y-4">
            <div className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
              {getText('hero.title1', 'title1')}
            </div>
            <div className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[#C9A961] via-[#D4B574] to-[#C9A961] bg-clip-text text-transparent leading-tight">
              {getText('hero.title2', 'title2')}
            </div>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {getText('hero.subtitle', 'subtitle')}
            <br />
            {getText('hero.subtitleLine2', 'subtitleLine2')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={() =>
                document
                  .getElementById('pricing')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] px-10 py-4 rounded-lg text-lg font-bold hover:shadow-2xl hover:shadow-[#C9A961]/30 transition-all duration-300 hover:scale-105 flex items-center space-x-3 cursor-pointer whitespace-nowrap"
            >
              <span>{getText('hero.cta', 'ctaPrimary')}</span>
              <i className="ri-arrow-right-line text-2xl"></i>
            </button>
            <button
              onClick={() =>
                document
                  .getElementById('how-it-works')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              className="border-2 border-[#3D3428] text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-[#3D3428]/20 transition-all duration-300 cursor-pointer whitespace-nowrap"
            >
              {getText('hero.ctaSecondary', 'ctaSecondary')}
            </button>
          </div>

          {/* Gutschein-Eingabefeld */}
          <div className="pt-10 max-w-md mx-auto">
            <div className="bg-[#1A1F26]/80 backdrop-blur-sm rounded-xl p-6 border border-[#3D3428]/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <i className="ri-gift-line text-[#C9A961] text-xl w-6 h-6 flex items-center justify-center"></i>
                  <span className="text-white font-medium">
                    Gutschein-Code einlösen
                  </span>
                </div>
                {suggestedCode && (
                  <span className="text-xs text-[#C9A961] bg-[#C9A961]/10 px-2 py-1 rounded-full">
                    Empfohlen
                  </span>
                )}
              </div>

              <form onSubmit={handleCouponSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setError('');
                  }}
                  placeholder="z.B. NF-7X3K9M"
                  className={`flex-1 bg-[#0F1419] border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors text-sm font-mono ${
                    error
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[#3D3428]/50 focus:border-[#C9A961]'
                  }`}
                  disabled={isValidating}
                />
                <button
                  type="submit"
                  disabled={isValidating}
                  className="bg-[#3D3428] hover:bg-[#4D4438] text-white px-5 py-3 rounded-lg font-medium transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isValidating ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      <span>Prüfe...</span>
                    </>
                  ) : (
                    <>
                      <span>Aktivieren</span>
                      <i className="ri-arrow-right-s-line"></i>
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
                  <i className="ri-error-warning-line"></i>
                  <span>{error}</span>
                </div>
              )}

              {!error && (
                <p className="text-gray-500 text-xs mt-3">
                  {suggestedCode
                    ? `Code "${suggestedCode}" ist bereits eingetragen – klicke auf Aktivieren!`
                    : 'Hast du einen Gutschein? Teste unseren KI-Assistenten 7 Tage kostenlos!'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-[#C9A961]">
                {getText('hero.stat1Value', 'stat1Value')}
              </div>
              <div className="text-sm text-gray-400">
                {getText('hero.stat1Label', 'stat1Label')}
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-[#C9A961]">
                {getText('hero.stat2Value', 'stat2Value')}
              </div>
              <div className="text-sm text-gray-400">
                {getText('hero.stat2Label', 'stat2Label')}
              </div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-[#C9A961]">
                {getText('hero.stat3Value', 'stat3Value')}
              </div>
              <div className="text-sm text-gray-400">
                {getText('hero.stat3Label', 'stat3Label')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
