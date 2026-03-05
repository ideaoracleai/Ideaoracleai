import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { creditHistory as initialCreditHistory } from '../../../mocks/dashboardData';
import { useSubscription } from '../../../hooks/useSubscription';

interface CreditUsageProps {
  fullView?: boolean;
}

interface UserData {
  plan: string;
  credits: number;
  maxCredits: number;
  nextReset: string;
}

interface PlanFeature {
  text: string;
  isCommon: boolean;
  isNegative?: boolean;
  isSpecial?: boolean;
}

interface PlanDetail {
  price: number;
  credits: number;
  features: PlanFeature[];
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'twint';
  label: string;
  icon: string;
}

interface BillingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

interface Transaction {
  id: string;
  date: string;
  plan: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
}

export default function CreditUsage({ fullView = false }: CreditUsageProps) {
  const { t } = useTranslation();
  
  // Zentraler Subscription Hook
  const { subscription, changePlan, usagePercentage } = useSubscription();
  
  const [creditHistory] = useState(initialCreditHistory);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Payment States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'paypal' | 'twint'>('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  
  // Card Data
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  
  // Billing Address
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'CH'
  });
  
  // Validation Errors
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  // Email Notification States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const paymentMethods: PaymentMethod[] = [
    { id: 'card', type: 'card', label: 'Kreditkarte', icon: 'ri-bank-card-line' },
    { id: 'paypal', type: 'paypal', label: 'PayPal', icon: 'ri-paypal-line' },
    { id: 'twint', type: 'twint', label: 'TWINT', icon: 'ri-smartphone-line' }
  ];

  const planDetails: Record<string, PlanDetail> = {
    Starter: {
      price: 39.90,
      credits: 2500,
      features: [
        { text: t('pricing.starter.feature1'), isCommon: true },
        { text: t('pricing.starter.feature2'), isCommon: true },
        { text: t('pricing.starter.feature3'), isCommon: true },
        { text: t('pricing.starter.feature4'), isCommon: true },
        { text: t('pricing.starter.feature5'), isCommon: true },
        { text: t('pricing.starter.feature6'), isCommon: true },
        { text: t('pricing.starter.feature7'), isCommon: true },
        { text: t('pricing.starter.feature8'), isCommon: true, isNegative: true },
      ]
    },
    Pro: {
      price: 59.90,
      credits: 5000,
      features: [
        { text: t('pricing.pro.feature1'), isCommon: true },
        { text: t('pricing.pro.feature2'), isCommon: true },
        { text: t('pricing.pro.feature3'), isCommon: true },
        { text: t('pricing.pro.feature4'), isCommon: true },
        { text: t('pricing.pro.feature5'), isCommon: true },
        { text: t('pricing.pro.feature6'), isCommon: true },
        { text: t('pricing.pro.feature7'), isCommon: true },
        { text: t('pricing.pro.feature8'), isCommon: true, isNegative: true },
      ]
    },
    Builder: {
      price: 199,
      credits: -1,
      features: [
        { text: t('pricing.builder.feature1'), isCommon: true },
        { text: t('pricing.builder.feature2'), isCommon: true },
        { text: t('pricing.builder.feature3'), isCommon: true },
        { text: t('pricing.builder.feature4'), isCommon: true },
        { text: t('pricing.builder.feature5'), isCommon: true },
        { text: t('pricing.builder.feature6'), isCommon: false, isSpecial: true },
        { text: t('pricing.builder.feature7'), isCommon: false, isSpecial: true },
        { text: t('pricing.builder.feature8'), isCommon: true },
      ]
    }
  };

  const usedCredits = subscription.maxCredits > 0 ? subscription.maxCredits - subscription.credits : 0;

  const handleUpgrade = (newPlan: string) => {
    const planInfo = planDetails[newPlan as keyof typeof planDetails];
    
    // Zentralen Hook verwenden
    changePlan(newPlan);
    
    // Create transaction record
    const transaction: Transaction = {
      id: `TXN-${Date.now()}`,
      date: new Date().toLocaleDateString('de-DE', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      plan: newPlan,
      amount: planInfo.price * 1.077, // Including VAT
      status: 'completed'
    };
    
    // Save transaction to localStorage
    const transactions = JSON.parse(localStorage.getItem('nichecheck_transactions') || '[]');
    transactions.unshift(transaction);
    localStorage.setItem('nichecheck_transactions', JSON.stringify(transactions));
    
    setCurrentTransaction(transaction);
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setPaymentSuccess(false);
    
    // Show email modal
    setShowEmailModal(true);
    setEmailSending(true);
    
    // Simulate email sending
    setTimeout(() => {
      setEmailSending(false);
      setEmailSent(true);
    }, 2500);
    
    // Show success notification and reload
    setTimeout(() => {
      setShowSuccessNotification(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }, 4000);
  };

  const confirmUpgrade = () => {
    if (selectedPlan) {
      setShowUpgradeModal(false);
      setShowPaymentModal(true);
    }
  };

  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  };

  const validateExpiry = (expiry: string): boolean => {
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return false;
    
    const month = parseInt(match[1]);
    const year = parseInt('20' + match[2]);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  };

  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  };

  const validateBillingAddress = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!billingAddress.firstName.trim()) errors.firstName = 'Vorname erforderlich';
    if (!billingAddress.lastName.trim()) errors.lastName = 'Nachname erforderlich';
    if (!billingAddress.street.trim()) errors.street = 'Strasse erforderlich';
    if (!billingAddress.city.trim()) errors.city = 'Stadt erforderlich';
    if (!billingAddress.postalCode.trim()) errors.postalCode = 'PLZ erforderlich';
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (selectedPaymentMethod === 'card') {
      if (!cardData.number || !validateCardNumber(cardData.number)) {
        errors.cardNumber = 'Ungültige Kartennummer';
      }
      if (!cardData.name.trim()) {
        errors.cardName = 'Name auf Karte erforderlich';
      }
      if (!cardData.expiry || !validateExpiry(cardData.expiry)) {
        errors.expiry = 'Ungültiges Ablaufdatum';
      }
      if (!cardData.cvv || !validateCVV(cardData.cvv)) {
        errors.cvv = 'Ungültiger CVV';
      }
    }
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0 && validateBillingAddress();
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;
    
    setIsProcessingPayment(true);
    setPaymentErrors({});
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    
    // Save payment method if requested
    if (savePaymentMethod) {
      const savedMethods = JSON.parse(localStorage.getItem('saved_payment_methods') || '[]');
      savedMethods.push({
        type: selectedPaymentMethod,
        lastFour: selectedPaymentMethod === 'card' ? cardData.number.slice(-4) : null,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('saved_payment_methods', JSON.stringify(savedMethods));
    }
    
    setTimeout(() => {
      if (selectedPlan) {
        handleUpgrade(selectedPlan);
      }
    }, 1500);
  };

  const handleDownloadInvoice = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `Rechnung_${currentTransaction?.id}.pdf`;
    link.click();
  };

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiry = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getAvailableUpgrades = () => {
    const plans = ['Starter', 'Pro', 'Builder'];
    const currentIndex = plans.indexOf(subscription.plan);
    return plans.slice(currentIndex + 1);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'Builder': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Pro': return 'bg-[#C9A961]/20 text-[#C9A961] border-[#C9A961]/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCreditsDisplay = (plan: string) => {
    switch (plan) {
      case 'Builder': return t('pricing.builder.credits');
      case 'Pro': return t('pricing.pro.credits');
      default: return t('pricing.starter.credits');
    }
  };

  return (
    <>
      <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#3D3428]/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Credit-Verbrauch</h2>
              <p className="text-sm text-gray-500 mt-1">Dein aktueller Verbrauch</p>
            </div>
            {getAvailableUpgrades().length > 0 && (
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap"
              >
                Upgrade
              </button>
            )}
          </div>

          <div className="mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getPlanBadgeColor(subscription.plan)}`}>
              <i className={`${subscription.plan === 'Builder' ? 'ri-vip-crown-fill' : subscription.plan === 'Pro' ? 'ri-star-fill' : 'ri-user-fill'}`}></i>
              <span className="text-sm font-medium">{subscription.plan} Plan</span>
            </div>
          </div>

          <div className="bg-[#0F1419] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Verbraucht</span>
              <span className="text-sm text-white font-medium">
                {subscription.maxCredits > 0 ? (
                  <>{usedCredits.toLocaleString()} / {subscription.maxCredits.toLocaleString()} Credits</>
                ) : (
                  <>{t('pricing.builder.credits')}</>
                )}
              </span>
            </div>
            {subscription.maxCredits > 0 ? (
              <div className="h-3 bg-[#3D3428]/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C9A961] to-[#A08748] rounded-full transition-all duration-500"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            ) : (
              <div className="h-3 bg-gradient-to-r from-amber-500/30 to-amber-400/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full w-full animate-pulse" />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {subscription.maxCredits > 0 ? `Reset am ${subscription.nextReset}` : t('pricing.builder.limitNote')}
            </p>
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Letzte Aktivitäten</h3>
          <div className="space-y-3">
            {(fullView ? creditHistory : creditHistory.slice(0, 5)).map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    item.change > 0 ? 'bg-emerald-500/10' : 'bg-[#0F1419]'
                  }`}>
                    <i className={`${
                      item.change > 0 ? 'ri-add-line text-emerald-400' : 'ri-subtract-line text-gray-400'
                    }`}></i>
                  </div>
                  <div>
                    <p className="text-sm text-white">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  item.change > 0 ? 'text-emerald-400' : 'text-gray-400'
                }`}>
                  {item.change > 0 ? '+' : ''}{item.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {fullView && (
          <div className="p-5 border-t border-[#3D3428]/30 bg-[#0F1419]">
            <h3 className="text-sm font-medium text-white mb-3">Dein aktuelles Paket</h3>
            <div className={`p-4 rounded-lg border ${
              subscription.plan === 'Builder' 
                ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30' 
                : getPlanBadgeColor(subscription.plan)
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{subscription.plan}</span>
                <span className={`font-bold ${subscription.plan === 'Builder' ? 'text-amber-400' : 'text-[#C9A961]'}`}>
                  {planDetails[subscription.plan as keyof typeof planDetails]?.price.toFixed(2)} CHF/Monat
                </span>
              </div>
              <p className={`text-xs mb-3 ${subscription.plan === 'Builder' ? 'text-amber-400/80' : 'text-gray-400'}`}>
                {getCreditsDisplay(subscription.plan)}
              </p>
              <ul className="space-y-1.5">
                {planDetails[subscription.plan as keyof typeof planDetails]?.features.map((feature, idx) => (
                  <li key={idx} className="text-xs flex items-center gap-2">
                    {feature.isNegative ? (
                      <i className="ri-close-line text-gray-500"></i>
                    ) : feature.isSpecial ? (
                      <i className="ri-star-fill text-amber-400"></i>
                    ) : (
                      <i className="ri-check-line text-emerald-400"></i>
                    )}
                    <span className={`${
                      feature.isNegative 
                        ? 'text-gray-500 line-through' 
                        : feature.isSpecial 
                          ? 'text-amber-400 font-semibold' 
                          : 'text-gray-400'
                    }`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {getAvailableUpgrades().length > 0 && (
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
              >
                Paket upgraden
              </button>
            )}
          </div>
        )}
      </div>

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-6 right-6 z-[60] animate-[slideInRight_0.3s_ease-out]">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl shadow-emerald-500/30 flex items-center gap-3 min-w-[320px]">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-check-line text-2xl"></i>
            </div>
            <div>
              <p className="font-semibold">Upgrade erfolgreich!</p>
              <p className="text-sm text-emerald-100">Dein neues Paket wird aktiviert...</p>
            </div>
          </div>
        </div>
      )}

      {/* Email Confirmation Modal */}
      {showEmailModal && currentTransaction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-[scaleIn_0.3s_ease-out]">
            {emailSending ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <i className="ri-mail-send-line text-[#C9A961] text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">E-Mail wird versendet...</h3>
                <p className="text-gray-400 mb-6">
                  Deine Bestätigung wird an deine E-Mail-Adresse gesendet
                </p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : emailSent ? (
              <div className="p-8">
                {/* Email Preview Header */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#3D3428]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <i className="ri-mail-check-line text-green-500 text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">E-Mail erfolgreich versendet!</h3>
                      <p className="text-sm text-gray-400">Bestätigung wurde an deine E-Mail gesendet</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEmailModal(false)}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                {/* Email Preview Content */}
                <div className="bg-white rounded-xl p-8 mb-6">
                  {/* Email Header */}
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-xl flex items-center justify-center">
                        <i className="ri-lightbulb-flash-line text-[#0F1419] text-2xl"></i>
                      </div>
                      <span className="text-2xl font-bold text-[#0F1419]">NicheFinder</span>
                    </div>
                    <span className="text-sm text-gray-500">{currentTransaction.date}</span>
                  </div>

                  {/* Email Body */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0F1419] mb-2">
                        Vielen Dank für dein Upgrade! 🎉
                      </h2>
                      <p className="text-gray-600">
                        Dein Upgrade auf den <strong>{currentTransaction.plan}</strong> Plan wurde erfolgreich abgeschlossen.
                      </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-[#0F1419] mb-4">Transaktionsdetails</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Transaktions-ID:</span>
                          <span className="font-mono text-sm text-[#0F1419]">{currentTransaction.id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Datum:</span>
                          <span className="text-[#0F1419]">{currentTransaction.date}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Paket:</span>
                          <span className="font-semibold text-[#0F1419]">{currentTransaction.plan}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Credits:</span>
                          <span className="font-semibold text-[#C9A961]">
                            {getCreditsDisplay(currentTransaction.plan)}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Betrag (inkl. MwSt.):</span>
                            <span className="text-xl font-bold text-[#0F1419]">
                              CHF {currentTransaction.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* What's Next */}
                    <div className="bg-gradient-to-br from-[#C9A961]/10 to-[#A08748]/5 rounded-lg p-6 border border-[#C9A961]/20">
                      <h3 className="text-lg font-bold text-[#0F1419] mb-3">Was passiert jetzt?</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <i className="ri-check-line text-[#C9A961] mt-0.5"></i>
                          <span className="text-gray-700">Deine Credits wurden sofort aufgeladen</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="ri-check-line text-[#C9A961] mt-0.5"></i>
                          <span className="text-gray-700">Alle Premium-Features sind jetzt freigeschaltet</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <i className="ri-check-line text-[#C9A961] mt-0.5"></i>
                          <span className="text-gray-700">Die Rechnung findest du im Anhang dieser E-Mail</span>
                        </li>
                      </ul>
                    </div>

                    {/* Support */}
                    <div className="text-center pt-6 border-t border-gray-200">
                      <p className="text-gray-600 text-sm mb-2">
                        Fragen? Unser Support-Team hilft dir gerne weiter.
                      </p>
                      <a href="mailto:support@nichefinder.com" className="text-[#C9A961] hover:underline text-sm font-medium">
                        support@nichefinder.com
                      </a>
                    </div>
                  </div>

                  {/* Email Footer */}
                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      © 2025 NicheFinder. Alle Rechte vorbehalten.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex-1 py-3 bg-[#0F1419] border border-[#3D3428]/30 text-white rounded-lg font-semibold hover:bg-[#3D3428]/20 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <i className="ri-download-line"></i>
                    <span>Rechnung herunterladen</span>
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 py-3 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                  >
                    Schliessen
                  </button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  <i className="ri-information-line mr-1"></i>
                  Eine Kopie dieser Bestätigung wurde an deine E-Mail-Adresse gesendet
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-[scaleIn_0.3s_ease-out]">
            <div className="p-6 border-b border-[#3D3428]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Paket upgraden</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Aktuell: <span className={getPlanBadgeColor(subscription.plan).split(' ')[1]}>{subscription.plan}</span>
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowUpgradeModal(false);
                    setSelectedPlan(null);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {getAvailableUpgrades().map((plan) => {
                const details = planDetails[plan as keyof typeof planDetails];
                const isBuilder = plan === 'Builder';
                const isSelected = selectedPlan === plan;
                
                return (
                  <div 
                    key={plan}
                    className={`p-5 rounded-xl border transition-all ${
                      isBuilder 
                        ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30' 
                        : 'bg-[#0F1419] border-[#3D3428]/30 hover:border-[#C9A961]/30'
                    } ${isSelected ? 'ring-2 ring-[#C9A961] ring-offset-2 ring-offset-[#1A1F26]' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{plan}</h3>
                          {plan === 'Pro' && (
                            <span className="px-2 py-0.5 bg-[#C9A961]/20 text-[#C9A961] text-xs rounded-full">
                              Beliebt
                            </span>
                          )}
                          {isBuilder && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${isBuilder ? 'text-amber-400/80' : 'text-gray-400'}`}>
                          {getCreditsDisplay(plan)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {details.price.toFixed(2)} <span className="text-sm font-normal text-gray-400">CHF</span>
                        </div>
                        <p className="text-xs text-gray-500">pro Monat</p>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {details.features.map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-center gap-2">
                          {feature.isNegative ? (
                            <i className="ri-close-line text-gray-500"></i>
                          ) : feature.isSpecial ? (
                            <i className="ri-star-fill text-amber-400"></i>
                          ) : (
                            <i className={`ri-check-line ${isBuilder ? 'text-amber-400' : 'text-emerald-400'}`}></i>
                          )}
                          <span className={`${
                            feature.isNegative 
                              ? 'text-gray-500 line-through' 
                              : feature.isSpecial 
                                ? 'text-amber-400 font-semibold' 
                                : 'text-gray-300'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full py-3 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : isBuilder
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg hover:shadow-amber-500/20'
                            : 'bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] hover:shadow-lg hover:shadow-[#C9A961]/20'
                      }`}
                    >
                      {isSelected ? (
                        <span className="flex items-center justify-center gap-2">
                          <i className="ri-check-line"></i>
                          Ausgewählt
                        </span>
                      ) : (
                        `${plan} auswählen`
                      )}
                    </button>
                  </div>
                );
              })}

              <div className="p-4 bg-[#0F1419] rounded-lg border border-[#3D3428]/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3D3428]/30 rounded-lg flex items-center justify-center">
                    <i className="ri-information-line text-gray-400"></i>
                  </div>
                  <div>
                    <p className="text-sm text-white">Dein aktuelles Paket: <strong>{subscription.plan}</strong></p>
                    <p className="text-xs text-gray-500">
                      Das Upgrade wird sofort aktiviert. Die Differenz wird anteilig berechnet.
                    </p>
                  </div>
                </div>
              </div>

              {selectedPlan && (
                <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-[#1A1F26] via-[#1A1F26] to-transparent">
                  <button
                    onClick={confirmUpgrade}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <i className="ri-arrow-right-up-line text-xl"></i>
                    Weiter zur Zahlung
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Sichere Zahlung • SSL-verschlüsselt
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-[scaleIn_0.3s_ease-out]">
            {/* Header */}
            <div className="p-6 border-b border-[#3D3428]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Zahlung abschliessen</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Upgrade auf <span className="text-[#C9A961] font-semibold">{selectedPlan}</span> Plan
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowPaymentModal(false);
                    setShowUpgradeModal(true);
                    setPaymentErrors({});
                  }}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#0F1419] rounded-lg transition-all cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>

            {paymentSuccess ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-[scaleIn_0.5s_ease-out]">
                  <i className="ri-check-line text-green-500 text-4xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Zahlung erfolgreich!</h3>
                <p className="text-gray-400 mb-6">
                  Dein Upgrade wird jetzt aktiviert...
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <i className="ri-loader-4-line animate-spin"></i>
                  <span>Paket wird aktualisiert</span>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Payment Form */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Zahlungsmethode
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {paymentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedPaymentMethod(method.type)}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              selectedPaymentMethod === method.type
                                ? 'border-[#C9A961] bg-[#C9A961]/10'
                                : 'border-[#3D3428]/30 bg-[#0F1419] hover:border-[#3D3428]'
                            }`}
                          >
                            <i className={`${method.icon} text-2xl ${
                              selectedPaymentMethod === method.type ? 'text-[#C9A961]' : 'text-gray-500'
                            }`}></i>
                            <p className={`text-xs mt-2 ${
                              selectedPaymentMethod === method.type ? 'text-white' : 'text-gray-500'
                            }`}>
                              {method.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Card Payment Form */}
                    {selectedPaymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Kartennummer
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardData.number}
                              onChange={(e) => {
                                const formatted = formatCardNumber(e.target.value);
                                setCardData({ ...cardData, number: formatted });
                                setPaymentErrors({ ...paymentErrors, cardNumber: '' });
                              }}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              className={`w-full bg-[#0F1419] border ${
                                paymentErrors.cardNumber ? 'border-red-500' : 'border-[#3D3428]/30'
                              } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                              <i className="ri-bank-card-line text-gray-500"></i>
                            </div>
                          </div>
                          {paymentErrors.cardNumber && (
                            <p className="mt-1 text-xs text-red-500">{paymentErrors.cardNumber}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Name auf Karte
                          </label>
                          <input
                            type="text"
                            value={cardData.name}
                            onChange={(e) => {
                              setCardData({ ...cardData, name: e.target.value });
                              setPaymentErrors({ ...paymentErrors, cardName: '' });
                            }}
                            placeholder="Max Mustermann"
                            className={`w-full bg-[#0F1419] border ${
                              paymentErrors.cardName ? 'border-red-500' : 'border-[#3D3428]/30'
                            } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                          />
                          {paymentErrors.cardName && (
                            <p className="mt-1 text-xs text-red-500">{paymentErrors.cardName}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Ablaufdatum
                            </label>
                            <input
                              type="text"
                              value={cardData.expiry}
                              onChange={(e) => {
                                const formatted = formatExpiry(e.target.value);
                                setCardData({ ...cardData, expiry: formatted });
                                setPaymentErrors({ ...paymentErrors, expiry: '' });
                              }}
                              placeholder="MM/JJ"
                              maxLength={5}
                              className={`w-full bg-[#0F1419] border ${
                                paymentErrors.expiry ? 'border-red-500' : 'border-[#3D3428]/30'
                              } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                            />
                            {paymentErrors.expiry && (
                              <p className="mt-1 text-xs text-red-500">{paymentErrors.expiry}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              value={cardData.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                                setCardData({ ...cardData, cvv: value });
                                setPaymentErrors({ ...paymentErrors, cvv: '' });
                              }}
                              placeholder="123"
                              maxLength={4}
                              className={`w-full bg-[#0F1419] border ${
                                paymentErrors.cvv ? 'border-red-500' : 'border-[#3D3428]/30'
                              } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                            />
                            {paymentErrors.cvv && (
                              <p className="mt-1 text-xs text-red-500">{paymentErrors.cvv}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal Info */}
                    {selectedPaymentMethod === 'paypal' && (
                      <div className="p-6 bg-[#0F1419] rounded-lg border border-[#3D3428]/30 text-center">
                        <i className="ri-paypal-line text-5xl text-[#0070BA] mb-4"></i>
                        <p className="text-white font-medium mb-2">PayPal-Zahlung</p>
                        <p className="text-sm text-gray-400">
                          Sie werden zu PayPal weitergeleitet, um die Zahlung abzuschliessen.
                        </p>
                      </div>
                    )}

                    {/* TWINT Info */}
                    {selectedPaymentMethod === 'twint' && (
                      <div className="p-6 bg-[#0F1419] rounded-lg border border-[#3D3428]/30 text-center">
                        <i className="ri-smartphone-line text-5xl text-[#FFED00] mb-4"></i>
                        <p className="text-white font-medium mb-2">TWINT-Zahlung</p>
                        <p className="text-sm text-gray-400">
                          Scannen Sie den QR-Code mit Ihrer TWINT-App.
                        </p>
                      </div>
                    )}

                    {/* Billing Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Rechnungsadresse
                      </label>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={billingAddress.firstName}
                              onChange={(e) => {
                                setBillingAddress({ ...billingAddress, firstName: e.target.value });
                                setPaymentErrors({ ...paymentErrors, firstName: '' });
                              }}
                              placeholder="Vorname"
                              className={`w-full bg-[#0F1419] border ${
                                paymentErrors.firstName ? 'border-red-500' : 'border-[#3D3428]/30'
                              } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                            />
                            {paymentErrors.firstName && (
                              <p className="mt-1 text-xs text-red-500">{paymentErrors.firstName}</p>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              value={billingAddress.lastName}
                              onChange={(e) => {
                                setBillingAddress({ ...billingAddress, lastName: e.target.value });
                                setPaymentErrors({ ...paymentErrors, lastName: '' });
                              }}
                              placeholder="Nachname"
                              className={`w-full bg-[#0F1419] border ${
                                paymentErrors.lastName ? 'border-red-500' : 'border-[#3D3428]/30'
                              } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                            />
                            {paymentErrors.lastName && (
                              <p className="mt-1 text-xs text-red-500">{paymentErrors.lastName}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <input
                            type="text"
                            value={billingAddress.street}
                            onChange={(e) => {
                              setBillingAddress({ ...billingAddress, street: e.target.value });
                              setPaymentErrors({ ...paymentErrors, street: '' });
                            }}
                            placeholder="Strasse und Hausnummer"
                            className={`w-full bg-[#0F1419] border ${
                                paymentErrors.street ? 'border-red-500' : 'border-[#3D3428]/30'
                              } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                          />
                          {paymentErrors.street && (
                            <p className="mt-1 text-xs text-red-500">{paymentErrors.street}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <input
                              type="text"
                              value={billingAddress.postalCode}
                              onChange={(e) => {
                                setBillingAddress({ ...billingAddress, postalCode: e.target.value });
                                setPaymentErrors({ ...paymentErrors, postalCode: '' });
                              }}
                              placeholder="PLZ"
                              className={`w-full bg-[#0F1419] border ${
                                paymentErrors.postalCode ? 'border-red-500' : 'border-[#3D3428]/30'
                              } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                            />
                            {paymentErrors.postalCode && (
                              <p className="mt-1 text-xs text-red-500">{paymentErrors.postalCode}</p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={billingAddress.city}
                              onChange={(e) => {
                                setBillingAddress({ ...billingAddress, city: e.target.value });
                                setPaymentErrors({ ...paymentErrors, city: '' });
                              }}
                              placeholder="Stadt"
                              className={`w-full bg-[#0F1419] border ${
                                paymentErrors.city ? 'border-red-500' : 'border-[#3D3428]/30'
                              } rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                            />
                            {paymentErrors.city && (
                              <p className="mt-1 text-xs text-red-500">{paymentErrors.city}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <select
                            value={billingAddress.country}
                            onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                            className="w-full bg-[#0F1419] border border-[#3D3428]/30 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#C9A961] transition-colors cursor-pointer"
                          >
                            <option value="CH">Schweiz</option>
                            <option value="DE">Deutschland</option>
                            <option value="AT">Österreich</option>
                            <option value="FR">Frankreich</option>
                            <option value="IT">Italien</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Save Payment Method */}
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={savePaymentMethod}
                          onChange={(e) => setSavePaymentMethod(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          savePaymentMethod ? 'bg-[#C9A961] border-[#C9A961]' : 'border-gray-500'
                        }`}>
                          {savePaymentMethod && (
                            <i className="ri-check-line text-[#0F1419] text-xs"></i>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        Zahlungsmethode für zukünftige Transaktionen speichern
                      </span>
                    </label>
                  </div>

                  {/* Right: Order Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-[#0F1419] rounded-xl border border-[#3D3428]/30 p-5 sticky top-6">
                      <h3 className="text-lg font-bold text-white mb-4">Bestellübersicht</h3>
                      
                      <div className="space-y-3 mb-4 pb-4 border-b border-[#3D3428]/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Aktuelles Paket</span>
                          <span className="text-sm text-white">{subscription.plan}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Neues Paket</span>
                          <span className="text-sm text-[#C9A961] font-semibold">{selectedPlan}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4 pb-4 border-b border-[#3D3428]/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Monatlicher Preis</span>
                          <span className="text-sm text-white">
                            CHF {planDetails[selectedPlan as keyof typeof planDetails]?.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">MwSt. (7.7%)</span>
                          <span className="text-sm text-white">
                            CHF {(planDetails[selectedPlan as keyof typeof planDetails]?.price * 0.077).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <span className="text-base font-semibold text-white">Gesamt</span>
                        <span className="text-xl font-bold text-[#C9A961]">
                          CHF {(planDetails[selectedPlan as keyof typeof planDetails]?.price * 1.077).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={handlePayment}
                        disabled={isProcessingPayment}
                        className="w-full py-4 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-bold hover:shadow-2xl hover:shadow-[#C9A961]/30 transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessingPayment ? (
                          <>
                            <i className="ri-loader-4-line animate-spin"></i>
                            <span>Zahlung wird verarbeitet...</span>
                          </>
                        ) : (
                          <>
                            <i className="ri-lock-line"></i>
                            <span>Jetzt bezahlen</span>
                          </>
                        )}
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                        <i className="ri-shield-check-line"></i>
                        <span>SSL-verschlüsselte Zahlung</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
