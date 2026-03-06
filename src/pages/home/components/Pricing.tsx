import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../../hooks/useCurrency';
import CurrencySelector from '../../../components/feature/CurrencySelector';

interface PlanData {
  id: string;
  name: string;
  price: string;
  description: string;
  credits: string;
  features: string[];
  negativeFeatures: number[];
  specialFeatures?: number[];
  highlighted: boolean;
}

interface PricingData {
  title: string;
  subtitle: string;
  plans: PlanData[];
}

export default function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [customData, setCustomData] = useState<PricingData | null>(null);
  const [isYearly, setIsYearly] = useState(false);

  // Währungs-Hook
  const { currency, formatPrice, getExchangeInfo, isEUR } = useCurrency();
  const exchangeInfo = getExchangeInfo();

  // Load custom pricing data from localStorage (if any)
  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_pricing');
      if (saved) {
        try {
          setCustomData(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse custom pricing data:', e);
          setCustomData(null);
        }
      } else {
        setCustomData(null);
      }
    };

    loadData();

    // Listen for storage changes (when admin saves data)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website_pricing') {
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

  const defaultPlans = [
    {
      nameKey: 'pricing.starter.name',
      price: 39.90,
      yearlyPrice: 39.90,
      descriptionKey: 'pricing.starter.description',
      creditsKey: 'pricing.starter.credits',
      features: [
        { key: 'pricing.starter.feature1', isCommon: true },
        { key: 'pricing.starter.feature2', isCommon: true },
        { key: 'pricing.starter.feature3', isCommon: true },
        { key: 'pricing.starter.feature4', isCommon: true },
        { key: 'pricing.starter.feature5', isCommon: true },
        { key: 'pricing.starter.feature6', isCommon: true },
        { key: 'pricing.starter.feature7', isCommon: true },
        { key: 'pricing.starter.feature9', isCommon: true },
        { key: 'pricing.starter.feature10', isCommon: true },
        { key: 'pricing.starter.feature11', isCommon: true },
        { key: 'pricing.starter.feature12', isCommon: true },
        { key: 'pricing.starter.feature13', isCommon: true },
        { key: 'pricing.starter.feature14', isCommon: true },
        { key: 'pricing.starter.feature15', isCommon: true },
        { key: 'pricing.starter.feature16', isCommon: true },
        { key: 'pricing.builder.feature6', isCommon: true, isNegative: true },
        { key: 'pricing.builder.feature7', isCommon: true, isNegative: true },
      ],
      highlighted: false,
      isBuilder: false,
      id: 'starter',
      hasDiscount: false,
    },
    {
      nameKey: 'pricing.pro.name',
      price: 59.90,
      yearlyPrice: 59.90,
      descriptionKey: 'pricing.pro.description',
      creditsKey: 'pricing.pro.credits',
      features: [
        { key: 'pricing.pro.feature1', isCommon: true },
        { key: 'pricing.pro.feature2', isCommon: true },
        { key: 'pricing.pro.feature3', isCommon: true },
        { key: 'pricing.pro.feature4', isCommon: true },
        { key: 'pricing.pro.feature5', isCommon: true },
        { key: 'pricing.pro.feature6', isCommon: true },
        { key: 'pricing.pro.feature7', isCommon: true },
        { key: 'pricing.pro.feature9', isCommon: true },
        { key: 'pricing.pro.feature10', isCommon: true },
        { key: 'pricing.pro.feature11', isCommon: true },
        { key: 'pricing.pro.feature12', isCommon: true },
        { key: 'pricing.pro.feature13', isCommon: true },
        { key: 'pricing.pro.feature14', isCommon: true },
        { key: 'pricing.pro.feature15', isCommon: true },
        { key: 'pricing.pro.feature16', isCommon: true },
        { key: 'pricing.builder.feature6', isCommon: true, isNegative: true },
        { key: 'pricing.builder.feature7', isCommon: true, isNegative: true },
      ],
      highlighted: false,
      isBuilder: false,
      id: 'pro',
      hasDiscount: false,
    },
    {
      nameKey: 'pricing.builder.name',
      price: 199,
      yearlyPrice: 159.20,
      descriptionKey: 'pricing.builder.description',
      creditsKey: 'pricing.builder.credits',
      features: [
        { key: 'pricing.builder.feature1', isCommon: true },
        { key: 'pricing.builder.feature2', isCommon: true },
        { key: 'pricing.builder.feature3', isCommon: true },
        { key: 'pricing.builder.feature4', isCommon: true },
        { key: 'pricing.builder.feature5', isCommon: true },
        { key: 'pricing.starter.feature6', isCommon: true },
        { key: 'pricing.starter.feature7', isCommon: true },
        { key: 'pricing.builder.feature9', isCommon: true },
        { key: 'pricing.builder.feature10', isCommon: true },
        { key: 'pricing.builder.feature11', isCommon: true },
        { key: 'pricing.builder.feature12', isCommon: true },
        { key: 'pricing.builder.feature13', isCommon: true },
        { key: 'pricing.builder.feature14', isCommon: true },
        { key: 'pricing.builder.feature15', isCommon: true },
        { key: 'pricing.builder.feature16', isCommon: true },
        { key: 'pricing.builder.feature6', isCommon: false, isSpecial: true },
        { key: 'pricing.builder.feature7', isCommon: false, isSpecial: true },
      ],
      highlighted: true,
      isBuilder: true,
      id: 'builder',
      hasDiscount: true,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    // Navigate directly to registration with plan and billing type
    navigate(`/auth?mode=register&plan=${planId}&billing=${isYearly ? 'yearly' : 'monthly'}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  // Render custom data if available
  if (customData) {
    return (
      <section
        id="pricing"
        className="py-24 px-6 lg:px-8 bg-gradient-to-b from-[#0F1419] to-[#1A1F26]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              {customData.title}
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              {customData.subtitle}
            </p>
            {/* Billing Toggle */}
            <div className="inline-flex items-center space-x-4 bg-[#1A1F26] px-6 py-3 rounded-full border border-[#3D3428]/30">
              <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                {t('pricing.monthly')}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${isYearly ? 'bg-[#C9A961]' : 'bg-[#3D3428]'
                  }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'
                    }`}
                />
              </button>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                  {t('pricing.yearly')}
                </span>
                <span className="px-2 py-0.5 bg-[#C9A961]/20 text-[#C9A961] text-xs font-bold rounded-full">
                  -20%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {customData.plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-gradient-to-br from-[#1A1F26] to-[#151A20] rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl cursor-pointer ${plan.highlighted
                  ? 'border-[#C9A961] shadow-xl shadow-[#C9A961]/20 scale-105'
                  : 'border-[#3D3428]/30 hover:border-[#C9A961]/50'
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                      {t('pricing.mostPopular')}
                    </div>
                  </div>
                )}

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 text-lg">CHF</span>
                    </div>
                    <div className="text-gray-500 text-sm">{t('pricing.perMonth')}</div>
                  </div>

                  <div
                    className={`px-4 py-3 rounded-lg border ${plan.id === 'builder'
                      ? 'bg-gradient-to-r from-[#C9A961]/20 to-[#A08748]/20 border-[#C9A961]/40'
                      : 'bg-[#3D3428]/20 border-[#3D3428]/30'
                      }`}
                  >
                    <div className="font-bold text-sm text-[#C9A961]">{plan.credits}</div>
                    <div className="text-gray-400 text-xs mt-1">
                      {plan.id === 'builder' ? '' : t('pricing.monthlyReset')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${plan.highlighted
                      ? 'bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] hover:shadow-lg hover:shadow-[#C9A961]/30'
                      : 'bg-[#3D3428]/30 text-white hover:bg-[#3D3428]/50 border border-[#3D3428]'
                      }`}
                  >
                    {t('pricing.selectPlan')}
                  </button>

                  <div className="space-y-1.5 pt-4">
                    {plan.features.map((feature, idx) => {
                      const isNeg = (plan.negativeFeatures || []).includes(idx);
                      const isSpec = (plan.specialFeatures || []).includes(idx);
                      return (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {isNeg ? (
                              <i className="ri-close-line text-lg text-gray-500"></i>
                            ) : isSpec ? (
                              <i className="ri-star-fill text-lg text-[#C9A961]"></i>
                            ) : (
                              <i className="ri-check-line text-lg text-[#C9A961]"></i>
                            )}
                          </div>
                          <span
                            className={`text-sm leading-relaxed ${isNeg
                              ? 'text-gray-500 line-through'
                              : isSpec
                                ? 'text-[#C9A961] font-semibold'
                                : 'text-gray-300'
                              }`}
                          >
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">{t('pricing.footer')}</p>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal}></div>
            <div className="relative bg-gradient-to-br from-[#1A1F26] to-[#151A20] rounded-2xl border border-[#3D3428]/50 p-8 max-w-md w-full shadow-2xl">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 flex items-center justify-center mx-auto bg-[#3D3428]/30 rounded-full">
                  <i className="ri-lock-line text-3xl text-[#C9A961]"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedPlan} {t('pricing.modal.selected')}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{t('pricing.modal.comingSoon')}</p>
                </div>
                <div className="bg-[#0F1419] rounded-xl p-4 border border-[#3D3428]/30">
                  <p className="text-gray-300 text-sm">{t('pricing.modal.patience')}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A961]/30 cursor-pointer whitespace-nowrap"
                >
                  {t('pricing.modal.understood')}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Fallback: default i18n‑driven plans
  return (
    <section id="pricing" className="py-24 px-6 lg:px-8 bg-gradient-to-b from-[#0F1419] to-[#1A1F26]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">{t('pricing.title')}</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">{t('pricing.subtitle')}</p>

          {/* Währungs-Auswahl & Billing Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            {/* Currency Selector */}
            <CurrencySelector variant="compact" />

            {/* Billing Toggle */}
            <div className="inline-flex items-center space-x-4 bg-[#1A1F26] px-6 py-3 rounded-full border border-[#3D3428]/30">
              <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                {t('pricing.monthly')}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${isYearly ? 'bg-[#C9A961]' : 'bg-[#3D3428]'
                  }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'
                    }`}
                />
              </button>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                  {t('pricing.yearly')}
                </span>
                <span className="px-2 py-0.5 bg-[#C9A961]/20 text-[#C9A961] text-xs font-bold rounded-full">
                  -20%
                </span>
              </div>
            </div>
          </div>

          {/* Währungs-Info Banner */}
          {isEUR && exchangeInfo && (
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-lg px-4 py-2 text-sm">
              <i className="ri-exchange-line text-[#C9A961]"></i>
              <span className="text-gray-300">
                Preise in Euro ({exchangeInfo.note})
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-xs">{exchangeInfo.billingNote}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {defaultPlans.map((plan, index) => {
            const basePriceCHF = isYearly && plan.hasDiscount ? plan.yearlyPrice : plan.price;
            const originalPriceCHF = plan.price;
            const showDiscount = isYearly && plan.hasDiscount;

            return (
              <div
                key={index}
                className={`relative bg-gradient-to-br from-[#1A1F26] to-[#151A20] rounded-3xl border-2 transition-all duration-300 hover:shadow-2xl cursor-pointer ${plan.highlighted
                  ? 'border-[#C9A961] shadow-xl shadow-[#C9A961]/20 scale-105'
                  : 'border-[#3D3428]/30 hover:border-[#C9A961]/50'
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                      {t('pricing.mostPopular')}
                    </div>
                  </div>
                )}

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-white">{t(plan.nameKey)}</h3>
                    <p className="text-gray-400 text-sm">{t(plan.descriptionKey)}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline space-x-2">
                      {showDiscount && (
                        <span className="text-2xl text-gray-500 line-through">
                          {formatPrice(originalPriceCHF, false)}
                        </span>
                      )}
                      <span className="text-5xl font-bold text-white">
                        {formatPrice(basePriceCHF, false)}
                      </span>
                      <span className="text-gray-400 text-lg">{currency.code}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">{t('pricing.perMonth')}</span>
                      {showDiscount && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                          -20% {t('pricing.savings')}
                        </span>
                      )}
                    </div>
                    {isYearly && (
                      <div className="text-xs text-gray-500">
                        {t('pricing.billedYearly')}
                      </div>
                    )}
                    {isEUR && (
                      <div className="text-xs text-gray-500 mt-1">
                        (CHF {basePriceCHF.toFixed(2)} Basis)
                      </div>
                    )}
                  </div>

                  <div
                    className={`px-4 py-3 rounded-lg border ${plan.isBuilder
                      ? 'bg-gradient-to-r from-[#C9A961]/20 to-[#A08748]/20 border-[#C9A961]/40'
                      : 'bg-[#3D3428]/20 border-[#3D3428]/30'
                      }`}
                  >
                    <div className="font-bold text-sm text-[#C9A961]">{t(plan.creditsKey)}</div>
                    <div className="text-gray-400 text-xs mt-1">
                      {plan.isBuilder ? '' : t('pricing.monthlyReset')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-300 cursor-pointer whitespace-nowrap ${plan.highlighted
                      ? 'bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] hover:shadow-lg hover:shadow-[#C9A961]/30'
                      : 'bg-[#3D3428]/30 text-white hover:bg-[#3D3428]/50 border border-[#3D3428]'
                      }`}
                  >
                    {t('pricing.selectPlan')}
                  </button>

                  <div className="space-y-1.5 pt-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {feature.isNegative ? (
                            <i className="ri-close-line text-lg text-red-500"></i>
                          ) : feature.isSpecial ? (
                            <i className="ri-star-fill text-lg text-[#C9A961]"></i>
                          ) : (
                            <i className="ri-check-line text-lg text-[#C9A961]"></i>
                          )}
                        </div>
                        <span
                          className={`text-sm leading-relaxed ${feature.isNegative
                            ? 'text-red-500 line-through'
                            : feature.isSpecial
                              ? 'text-[#C9A961] font-semibold'
                              : 'text-gray-300'
                            }`}
                        >
                          {t(feature.key)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">{t('pricing.footer')}</p>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-gradient-to-br from-[#1A1F26] to-[#151A20] rounded-2xl border border-[#3D3428]/50 p-8 max-w-md w-full shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 flex items-center justify-center mx-auto bg-[#3D3428]/30 rounded-full">
                <i className="ri-lock-line text-3xl text-[#C9A961]"></i>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">
                  {selectedPlan} {t('pricing.modal.selected')}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{t('pricing.modal.comingSoon')}</p>
              </div>
              <div className="bg-[#0F1419] rounded-xl p-4 border border-[#3D3428]/30">
                <p className="text-gray-300 text-sm">{t('pricing.modal.patience')}</p>
              </div>
              <button
                onClick={closeModal}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#C9A961]/30 cursor-pointer whitespace-nowrap"
              >
                {t('pricing.modal.understood')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
