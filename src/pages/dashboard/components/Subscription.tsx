import { useState, useCallback, useEffect } from 'react';
import {
  plans,
  savedCards as initialCards,
  paymentHistory,
  currentSubscription as initialSubscription,
  billingAddress as initialBilling,
} from '../../../mocks/subscriptionData';
import { defaultInvoiceSettings } from '../../../mocks/invoiceSettings';
import { useCurrency } from '../../../hooks/useCurrency';
import { useSubscription } from '../../../hooks/useSubscription';
import CurrencySelector from '../../../components/feature/CurrencySelector';

interface SubscriptionProps {
  onBack: () => void;
  onNavigateSettings?: () => void;
}

type TabType = 'overview' | 'payment' | 'billing' | 'history';

export default function Subscription({ onBack, onNavigateSettings }: SubscriptionProps) {
  // Zentraler Subscription Hook
  const { subscription: centralSubscription } = useSubscription();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showChangeCardModal, setShowChangeCardModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [editingBilling, setEditingBilling] = useState(false);
  const [billingAddress, setBillingAddress] = useState(initialBilling);
  const [cards, setCards] = useState(initialCards);
  
  // Subscription State mit zentralen Daten synchronisieren
  const [subscription, setSubscription] = useState({
    ...initialSubscription,
    plan: centralSubscription.plan,
    basePriceCHF: centralSubscription.basePriceCHF,
    price: centralSubscription.basePriceCHF,
    credits: centralSubscription.maxCredits,
    creditsUsed: centralSubscription.maxCredits > 0 ? centralSubscription.maxCredits - centralSubscription.credits : 0
  });
  
  // Synchronisiere mit zentralem Hook
  useEffect(() => {
    setSubscription(prev => ({
      ...prev,
      plan: centralSubscription.plan,
      basePriceCHF: centralSubscription.basePriceCHF,
      price: centralSubscription.basePriceCHF,
      credits: centralSubscription.maxCredits,
      creditsUsed: centralSubscription.maxCredits > 0 ? centralSubscription.maxCredits - centralSubscription.credits : 0
    }));
  }, [centralSubscription]);
  
  const [selectedPlanId, setSelectedPlanId] = useState(subscription.planId);
  const [expandedPlanFeatures, setExpandedPlanFeatures] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [invoiceConfig, setInvoiceConfig] = useState(defaultInvoiceSettings);

  // Load admin invoice settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem('invoiceSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setInvoiceConfig(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error('Failed to load invoice settings:', e);
    }

    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('invoiceSettings');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            setInvoiceConfig(prev => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {
        console.error('Failed to reload invoice settings:', e);
      }
    };
    window.addEventListener('invoiceSettingsUpdated', handleUpdate);
    return () => window.removeEventListener('invoiceSettingsUpdated', handleUpdate);
  }, []);

  // New card form
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    holderName: ''
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleCancelSubscription = () => {
    if (confirmText === 'K\u00dcNDIGEN') {
      setSubscription(prev => ({ ...prev, status: 'gek\u00fcndigt' }));
      setShowCancelModal(false);
      setConfirmText('');
      setCancelReason('');
      showToast('Dein Abo wurde zum Ende des Abrechnungszeitraums gek\u00fcndigt.', 'info');
    }
  };

  const handleReactivate = () => {
    setSubscription(prev => ({ ...prev, status: 'aktiv' }));
    showToast('Dein Abo wurde erfolgreich reaktiviert!', 'success');
  };

  const handleChangePlan = () => {
    const newPlan = plans.find(p => p.id === selectedPlanId);
    if (newPlan) {
      setSubscription(prev => ({
        ...prev,
        planId: newPlan.id,
        plan: newPlan.name,
        price: newPlan.price,
        credits: newPlan.credits === -1 ? 999999 : newPlan.credits
      }));
      setShowChangePlanModal(false);
      showToast(`Plan erfolgreich auf ${newPlan.name} ge\u00e4ndert!`, 'success');
    }
  };

  const handleSetDefaultCard = (cardId: string) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === cardId })));
    showToast('Standard-Zahlungsmethode ge\u00e4ndert.', 'success');
  };

  const handleDeleteCard = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card?.isDefault) {
      showToast('Die Standard-Karte kann nicht gel\u00f6scht werden.', 'error');
      return;
    }
    setCards(prev => prev.filter(c => c.id !== cardId));
    showToast('Karte wurde entfernt.', 'success');
  };

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc || !newCard.holderName) {
      showToast('Bitte f\u00fclle alle Felder aus.', 'error');
      return;
    }
    const last4 = newCard.number.replace(/\s/g, '').slice(-4);
    const newCardObj = {
      id: `card_${Date.now()}`,
      type: newCard.number.startsWith('4') ? 'Visa' : newCard.number.startsWith('5') ? 'Mastercard' : 'Karte',
      last4,
      expiry: newCard.expiry,
      holderName: newCard.holderName,
      isDefault: cards.length === 0
    };
    setCards(prev => [...prev, newCardObj]);
    setNewCard({ number: '', expiry: '', cvc: '', holderName: '' });
    setShowAddCardModal(false);
    showToast('Neue Karte erfolgreich hinzugef\u00fcgt!', 'success');
  };

  const handleSaveBilling = () => {
    setEditingBilling(false);
    showToast('Rechnungsadresse gespeichert.', 'success');
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const generateInvoicePDF = async (payment: typeof paymentHistory[0]) => {
    setDownloadingId(payment.id);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      const cfg = invoiceConfig;

      // Colors from admin settings
      const accentRgb: [number, number, number] = cfg.accentColorRgb || [201, 169, 97];
      const headerBgRgb: [number, number, number] = cfg.headerBgColorRgb || [15, 20, 25];
      const dark: [number, number, number] = [15, 20, 25];
      const gray: [number, number, number] = [120, 120, 120];
      const lightGray: [number, number, number] = [200, 200, 200];

      // Header bar
      doc.setFillColor(...headerBgRgb);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Logo - use uploaded image if available, otherwise use initials
      if (cfg.logoUrl) {
        try {
          // Add uploaded logo image
          const logoSize = 18;
          const logoX = 16;
          const logoY = 13;
          doc.addImage(cfg.logoUrl, 'PNG', logoX, logoY, logoSize, logoSize);
        } catch (err) {
          console.error('Failed to add logo image, using fallback:', err);
          // Fallback to circle with initials
          doc.setFillColor(...accentRgb);
          doc.circle(25, 22, 10, 'F');
          doc.setTextColor(...headerBgRgb);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(cfg.logoInitials || 'IO', 25, 26, { align: 'center' });
        }
      } else {
        // Logo circle with initials (fallback)
        doc.setFillColor(...accentRgb);
        doc.circle(25, 22, 10, 'F');
        doc.setTextColor(...headerBgRgb);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(cfg.logoInitials || 'IO', 25, 26, { align: 'center' });
      }

      // Company name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(cfg.companyName, 42, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...accentRgb);
      doc.text(cfg.companySlogan, 42, 28);

      // Invoice title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RECHNUNG', pageWidth - 20, 20, { align: 'right' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(payment.invoice, pageWidth - 20, 28, { align: 'right' });

      // Company info (left)
      let y = 60;
      doc.setTextColor(...dark);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('VON', 20, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...gray);
      doc.setFontSize(9);
      y += 7;
      doc.text(cfg.companyName, 20, y);
      y += 5;
      doc.text(cfg.companyStreet, 20, y);
      y += 5;
      doc.text(`${cfg.companyZip} ${cfg.companyCity}`, 20, y);
      y += 5;
      doc.text(cfg.companyCountry, 20, y);
      y += 5;
      doc.text(`USt-IdNr: ${cfg.companyVatId}`, 20, y);
      if (cfg.companyPhone) {
        y += 5;
        doc.text(`Tel: ${cfg.companyPhone}`, 20, y);
      }

      // Customer info (right)
      y = 60;
      doc.setTextColor(...dark);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('AN', pageWidth / 2 + 10, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...gray);
      doc.setFontSize(9);
      y += 7;
      doc.text(billingAddress.name, pageWidth / 2 + 10, y);
      y += 5;
      if (billingAddress.company) {
        doc.text(billingAddress.company, pageWidth / 2 + 10, y);
        y += 5;
      }
      doc.text(billingAddress.street, pageWidth / 2 + 10, y);
      y += 5;
      doc.text(`${billingAddress.zip} ${billingAddress.city}`, pageWidth / 2 + 10, y);
      y += 5;
      doc.text(billingAddress.country, pageWidth / 2 + 10, y);
      if (billingAddress.vatId) {
        y += 5;
        doc.text(`USt-IdNr: ${billingAddress.vatId}`, pageWidth / 2 + 10, y);
      }

      // Invoice details
      y = 115;
      doc.setDrawColor(...lightGray);
      doc.line(20, y, pageWidth - 20, y);
      y += 10;

      // Date and invoice info
      doc.setTextColor(...dark);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Rechnungsdatum: ${payment.date}`, 20, y);
      doc.text(`Rechnungsnummer: ${payment.invoice}`, pageWidth - 20, y, { align: 'right' });
      y += 6;
      doc.text(`Zahlungsstatus: ${payment.status}`, 20, y);
      doc.text('Zahlungsmethode: Kreditkarte', pageWidth - 20, y, { align: 'right' });

      // Table
      y += 15;
      doc.setFillColor(245, 245, 245);
      doc.rect(20, y - 5, pageWidth - 40, 12, 'F');
      doc.setTextColor(...dark);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('BESCHREIBUNG', 25, y + 2);
      doc.text('MENGE', 110, y + 2);
      doc.text('PREIS', 140, y + 2);
      doc.text('BETRAG', pageWidth - 25, y + 2, { align: 'right' });

      const netAmount = payment.amount - payment.tax;

      y += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...gray);
      doc.text(payment.description, 25, y);
      doc.text('1', 115, y);
      doc.text(`${cfg.currency} ${netAmount.toFixed(2)}`, 140, y);
      doc.text(`${cfg.currency} ${netAmount.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });

      // Totals
      y += 20;
      doc.setDrawColor(...lightGray);
      doc.line(120, y, pageWidth - 20, y);
      y += 10;
      doc.setTextColor(...gray);
      doc.text('Zwischensumme:', 120, y);
      doc.text(`${cfg.currency} ${netAmount.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });
      y += 7;
      doc.text(`${cfg.taxLabel} (${cfg.taxRate}%):`, 120, y);
      doc.text(`${cfg.currency} ${payment.tax.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });
      y += 3;
      doc.setDrawColor(...accentRgb);
      doc.setLineWidth(0.5);
      doc.line(120, y + 2, pageWidth - 20, y + 2);
      y += 10;
      doc.setTextColor(...dark);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Gesamtbetrag:', 120, y);
      doc.text(`${cfg.currency} ${payment.amount.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });

      // Payment terms & bank info
      let infoY = y + 18;
      if (cfg.paymentTerms || cfg.bankName) {
        doc.setFillColor(248, 248, 248);
        doc.rect(20, infoY - 4, pageWidth - 40, cfg.bankName ? 22 : 14, 'F');
        doc.setTextColor(...gray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        if (cfg.paymentTerms) {
          doc.text(cfg.paymentTerms, 25, infoY + 3);
          infoY += 7;
        }
        if (cfg.bankName) {
          doc.text(`Bank: ${cfg.bankName} | IBAN: ${cfg.iban} | BIC: ${cfg.bic}`, 25, infoY + 3);
          infoY += 7;
        }
        infoY += 5;
      }

      // Thank you text
      if (cfg.thankYouText) {
        infoY += 5;
        doc.setTextColor(...accentRgb);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(cfg.thankYouText, pageWidth / 2, infoY, { align: 'center' });
        infoY += 8;
      }

      // Notes
      if (cfg.notes) {
        infoY += 3;
        doc.setTextColor(...gray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        const noteLines = doc.splitTextToSize(cfg.notes, pageWidth - 50);
        doc.text(noteLines, 25, infoY);
      }

      // Footer
      const footerY = 270;
      doc.setDrawColor(...lightGray);
      doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
      doc.setTextColor(...gray);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const footerL1 = cfg.footerLine1 || `${cfg.companyName} | ${cfg.companyStreet}, ${cfg.companyZip} ${cfg.companyCity} | ${cfg.companyEmail}`;
      const footerL2 = cfg.footerLine2 || `${cfg.companyWebsite} | USt-IdNr: ${cfg.companyVatId}`;
      doc.text(footerL1, pageWidth / 2, footerY + 2, { align: 'center' });
      doc.text(footerL2, pageWidth / 2, footerY + 8, { align: 'center' });

      // Accent line at bottom
      doc.setFillColor(...accentRgb);
      doc.rect(0, 292, pageWidth, 5, 'F');

      doc.save(`${payment.invoice}.pdf`);
      showToast(`Rechnung ${payment.invoice} heruntergeladen!`, 'success');
    } catch {
      showToast('Fehler beim Erstellen der PDF.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const downloadAllInvoices = async () => {
    for (const payment of paymentHistory) {
      await generateInvoicePDF(payment);
      await new Promise(r => setTimeout(r, 500));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktiv': return 'text-emerald-400 bg-emerald-400/10';
      case 'gek\u00fcndigt': return 'text-red-400 bg-red-400/10';
      case 'pausiert': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'Visa': return 'ri-visa-line';
      case 'Mastercard': return 'ri-mastercard-line';
      default: return 'ri-bank-card-line';
    }
  };

  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'overview', icon: 'ri-file-list-3-line', label: 'Übersicht' },
    { id: 'payment', icon: 'ri-bank-card-line', label: 'Zahlungsmethoden' },
    { id: 'billing', icon: 'ri-file-text-line', label: 'Rechnungsadresse' },
    { id: 'history', icon: 'ri-history-line', label: 'Zahlungshistorie' }
  ];

  // Währungs-Hook
  const { currency, formatPrice, getExchangeInfo, isEUR } = useCurrency();
  const exchangeInfo = getExchangeInfo();

  return (
    <div className="max-w-5xl mx-auto">
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

      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-arrow-left-line"></i>
          Zurück zur Übersicht
        </button>
        <div className="flex items-center gap-3">
          <CurrencySelector variant="compact" />
          {onNavigateSettings && (
            <button onClick={onNavigateSettings} className="flex items-center gap-2 text-gray-400 hover:text-[#C9A961] transition-colors cursor-pointer whitespace-nowrap text-sm">
              <i className="ri-settings-3-line"></i>
              Einstellungen
            </button>
          )}
        </div>
      </div>

      {/* Währungs-Info Banner */}
      {isEUR && exchangeInfo && (
        <div className="mb-4 bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <i className="ri-information-line text-[#C9A961]"></i>
            <div className="flex-1">
              <p className="text-sm text-white">
                Preise werden in <span className="font-semibold text-[#C9A961]">Euro</span> angezeigt
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Kurs: {exchangeInfo.note} • {exchangeInfo.billingNote}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Aktueller Kurs</span>
              <div className="text-sm font-semibold text-white">{exchangeInfo.displayRate}</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#3D3428]/30">
          <h1 className="text-2xl font-bold text-white mb-2">Abo & Zahlung</h1>
          <p className="text-gray-400 text-sm">Verwalte dein Abonnement, Zahlungsmethoden und Rechnungen</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#3D3428]/30">
          <div className="flex gap-1 p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ===== ÜBERSICHT ===== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">{subscription.plan} Plan</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Mitglied seit {subscription.startDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">{formatPrice(subscription.basePriceCHF)}</div>
                    <div className="text-sm text-gray-400">pro Monat</div>
                    {isEUR && (
                      <div className="text-xs text-gray-500 mt-1">
                        (CHF {subscription.basePriceCHF.toFixed(2)} Basis)
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#1A1F26] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
                        <i className="ri-calendar-line text-[#C9A961]"></i>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Nächste Abrechnung</div>
                        <div className="text-white font-semibold text-sm">{subscription.nextBilling}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1A1F26] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
                        <i className="ri-coin-line text-[#C9A961]"></i>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Credits verbraucht</div>
                        <div className="text-white font-semibold text-sm">
                          {subscription.creditsUsed.toLocaleString()} / {subscription.credits > 99999 ? '∞' : subscription.credits.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#1A1F26] rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
                        <i className="ri-bank-card-line text-[#C9A961]"></i>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Zahlungsmethode</div>
                        <div className="text-white font-semibold text-sm">
                          {cards.find(c => c.isDefault)?.type} •••• {cards.find(c => c.isDefault)?.last4}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit usage bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Credit-Verbrauch</span>
                    <span className="text-xs text-gray-400">
                      {subscription.credits > 99999 ? 'Unlimited' : `${Math.round((subscription.creditsUsed / subscription.credits) * 100)}%`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1A1F26] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C9A961] to-[#A08748] rounded-full transition-all duration-500"
                      style={{ width: `${subscription.credits > 99999 ? 15 : Math.min((subscription.creditsUsed / subscription.credits) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <button
                    onClick={() => setShowChangePlanModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-exchange-line"></i>
                    Plan ändern
                  </button>
                  {(subscription.status === 'gekündigt' || subscription.status === 'pausiert') && (
                    <button
                      onClick={handleReactivate}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F26] border border-emerald-500/30 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-play-circle-line"></i>
                      Reaktivieren
                    </button>
                  )}
                  {subscription.status !== 'gekündigt' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F26] border border-red-500/30 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-close-circle-line"></i>
                      Abo kündigen
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('payment')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-sm font-medium text-white hover:border-[#C9A961]/30 hover:text-[#C9A961] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-bank-card-line"></i>
                    Karten verwalten
                  </button>
                </div>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('history')}
                  className="bg-[#0F1419] border border-[#3D3428]/30 rounded-xl p-5 text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#C9A961]/10 rounded-lg flex items-center justify-center group-hover:bg-[#C9A961]/20 transition-colors">
                      <i className="ri-file-download-line text-[#C9A961] text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Rechnungen herunterladen</h3>
                      <p className="text-gray-400 text-xs mt-1">{paymentHistory.length} Rechnungen als PDF verfügbar</p>
                    </div>
                    <i className="ri-arrow-right-s-line text-gray-400 ml-auto text-xl"></i>
                  </div>
                </button>
                {onNavigateSettings && (
                  <button
                    onClick={onNavigateSettings}
                    className="bg-[#0F1419] border border-[#3D3428]/30 rounded-xl p-5 text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#C9A961]/10 rounded-lg flex items-center justify-center group-hover:bg-[#C9A961]/20 transition-colors">
                        <i className="ri-settings-3-line text-[#C9A961] text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">Konto-Einstellungen</h3>
                        <p className="text-gray-400 text-xs mt-1">Profil, Benachrichtigungen & mehr</p>
                      </div>
                      <i className="ri-arrow-right-s-line text-gray-400 ml-auto text-xl"></i>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ===== ZAHLUNGSMETHODEN ===== */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Gespeicherte Karten</h2>
                  <button
                    onClick={() => setShowAddCardModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-add-line"></i>
                    Neue Karte
                  </button>
                </div>

                <div className="space-y-4">
                  {cards.map(card => (
                    <div key={card.id} className={`relative rounded-xl p-5 border transition-all ${
                      card.isDefault
                        ? 'bg-gradient-to-br from-[#C9A961]/10 to-[#A08748]/5 border-[#C9A961]/40'
                        : 'bg-[#1A1F26] border-[#3D3428]/30 hover:border-[#3D3428]/50'
                    }`}>
                      {card.isDefault && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#C9A961]/20 rounded-full">
                          <span className="text-[#C9A961] text-xs font-semibold">Standard</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-[#0F1419] rounded-lg flex items-center justify-center border border-[#3D3428]/30">
                          <i className={`${getCardIcon(card.type)} text-2xl text-white`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">{card.type}</span>
                            <span className="text-gray-400 text-sm">•••• {card.last4}</span>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {card.holderName} · Gültig bis {card.expiry}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!card.isDefault && (
                            <button
                              onClick={() => handleSetDefaultCard(card.id)}
                              className="px-3 py-2 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-xs font-medium text-gray-300 hover:text-[#C9A961] hover:border-[#C9A961]/30 hover:bg-[#C9A961]/5 transition-all cursor-pointer whitespace-nowrap"
                            >
                              Als Standard
                            </button>
                          )}
                          {!card.isDefault && (
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="w-9 h-9 flex items-center justify-center bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-gray-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all cursor-pointer"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {cards.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#1A1F26] rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-bank-card-line text-3xl text-gray-500"></i>
                    </div>
                    <p className="text-gray-400 text-sm">Keine Karten gespeichert</p>
                    <button
                      onClick={() => setShowAddCardModal(true)}
                      className="mt-4 px-5 py-2.5 bg-[#C9A961]/20 text-[#C9A961] rounded-lg text-sm font-medium hover:bg-[#C9A961]/30 transition-all cursor-pointer whitespace-nowrap"
                    >
                      Erste Karte hinzufügen
                    </button>
                  </div>
                )}
              </div>

              {/* Payment security info */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="ri-shield-check-line text-emerald-400 text-xl mt-0.5"></i>
                  <div>
                    <h3 className="text-emerald-400 font-semibold text-sm mb-1">Sichere Zahlungen</h3>
                    <p className="text-emerald-300/80 text-xs">
                      Alle Zahlungsdaten werden verschlüsselt übertragen und sicher bei unserem Zahlungsanbieter gespeichert. Wir speichern keine vollständigen Kartennummern.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== RECHNUNGSADRESSE ===== */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Rechnungsadresse</h2>
                  {!editingBilling && (
                    <button
                      onClick={() => setEditingBilling(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-sm font-medium text-white hover:border-[#C9A961]/30 hover:text-[#C9A961] transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-edit-line"></i>
                      Bearbeiten
                    </button>
                  )}
                </div>

                {editingBilling ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Name *</label>
                      <input type="text" value={billingAddress.name} onChange={(e) => setBillingAddress({ ...billingAddress, name: e.target.value })} className="w-full px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Straße & Hausnummer *</label>
                      <input type="text" value={billingAddress.street} onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })} className="w-full px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">PLZ *</label>
                        <input type="text" value={billingAddress.zip} onChange={(e) => setBillingAddress({ ...billingAddress, zip: e.target.value })} className="w-full px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white mb-2">Stadt *</label>
                        <input type="text" value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} className="w-full px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Land *</label>
                      <select value={billingAddress.country} onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })} className="w-full px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm cursor-pointer">
                        <option value="Schweiz">Schweiz</option>
                        <option value="Deutschland">Deutschland</option>
                        <option value="Österreich">Österreich</option>
                        <option value="Niederlande">Niederlande</option>
                        <option value="Belgien">Belgien</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button onClick={handleSaveBilling} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap">
                        <i className="ri-check-line"></i>
                        Speichern
                      </button>
                      <button onClick={() => setEditingBilling(false)} className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg font-medium text-white hover:border-[#3D3428]/50 transition-all cursor-pointer whitespace-nowrap">
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Name</div>
                      <div className="text-white font-medium text-sm">{billingAddress.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Adresse</div>
                      <div className="text-white font-medium text-sm">
                        {billingAddress.street}<br />
                        {billingAddress.zip} {billingAddress.city}<br />
                        {billingAddress.country}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== ZAHLUNGSHISTORIE ===== */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-[#3D3428]/30 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Zahlungshistorie</h2>
                    <p className="text-gray-400 text-xs">Alle Rechnungen als PDF mit Logo herunterladen</p>
                  </div>
                  <button
                    onClick={downloadAllInvoices}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-download-2-line"></i>
                    Alle herunterladen
                  </button>
                </div>

                {/* Währungs-Hinweis in Historie */}
                {isEUR && (
                  <div className="px-6 py-3 bg-[#C9A961]/5 border-b border-[#3D3428]/30">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <i className="ri-information-line text-[#C9A961]"></i>
                      <span>Rechnungen werden immer in CHF ausgestellt. Angezeigte EUR-Beträge dienen nur zur Orientierung.</span>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1A1F26]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Datum</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Beschreibung</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Netto</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">MwSt.</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Gesamt</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3D3428]/30">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="hover:bg-[#1A1F26]/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{payment.date}</td>
                          <td className="px-6 py-4 text-sm text-white">{payment.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatPrice(payment.amount - payment.tax)}
                            {isEUR && <span className="text-xs text-gray-500 ml-1">(CHF {(payment.amount - payment.tax).toFixed(2)})</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatPrice(payment.tax)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                            {formatPrice(payment.amount)}
                            {isEUR && <span className="text-xs text-gray-500 ml-2">
                              (CHF {payment.amount.toFixed(2)})
                            </span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-400/10">{payment.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => generateInvoicePDF(payment)}
                              disabled={downloadingId === payment.id}
                              className="flex items-center gap-2 text-[#C9A961] hover:text-[#A08748] transition-colors cursor-pointer whitespace-nowrap text-sm disabled:opacity-50"
                            >
                              {downloadingId === payment.id ? (
                                <i className="ri-loader-4-line animate-spin"></i>
                              ) : (
                                <i className="ri-file-pdf-2-line"></i>
                              )}
                              {payment.invoice}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 border-t border-[#3D3428]/30 bg-[#1A1F26]/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">{paymentHistory.length} Rechnungen</div>
                    <div className="text-sm text-white font-semibold">
                      Gesamtbetrag: {formatPrice(paymentHistory.reduce((sum, p) => sum + p.amount, 0))}
                      {isEUR && (
                        <span className="text-xs text-gray-500 ml-2">
                          (CHF {paymentHistory.reduce((sum, p) => sum + p.amount, 0).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== PLAN ÄNDERN MODAL ===== */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Plan ändern</h2>
              <button onClick={() => setShowChangePlanModal(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            {/* Währungs-Info im Modal */}
            {isEUR && exchangeInfo && (
              <div className="mb-4 bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs">
                  <i className="ri-information-line text-[#C9A961]"></i>
                  <span className="text-gray-300">
                    Preise in EUR angezeigt ({exchangeInfo.note}). Abrechnung erfolgt in CHF.
                  </span>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full p-5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPlanId === plan.id
                      ? 'border-[#C9A961] bg-[#C9A961]/10'
                      : 'border-[#3D3428]/30 bg-[#0F1419] hover:border-[#3D3428]/50'
                  } ${subscription.planId === plan.id ? 'ring-1 ring-emerald-500/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-bold">{plan.name}</h3>
                      {subscription.planId === plan.id && (
                        <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 text-xs rounded-full font-medium">Aktuell</span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        {formatPrice(plan.basePriceCHF)}
                        <span className="text-gray-400 text-xs font-normal">/Monat</span>
                      </div>
                      {isEUR && (
                        <div className="text-xs text-gray-500">CHF {plan.basePriceCHF.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {plan.features.slice(0, expandedPlanFeatures === plan.id ? undefined : 4).map((f, i) => (
                      <span key={i} className="text-xs text-gray-400 bg-[#1A1F26] px-2 py-1 rounded">{f}</span>
                    ))}
                    {plan.features.length > 4 && (
                      <span
                        onClick={(e) => { e.stopPropagation(); setExpandedPlanFeatures(expandedPlanFeatures === plan.id ? null : plan.id); }}
                        className="text-xs text-[#C9A961] hover:text-[#D4B872] cursor-pointer transition-colors"
                      >
                        {expandedPlanFeatures === plan.id ? 'Weniger anzeigen' : `+${plan.features.length - 4} mehr`}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowChangePlanModal(false)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm font-medium text-white hover:border-[#3D3428]/50 transition-all cursor-pointer whitespace-nowrap">
                Abbrechen
              </button>
              <button
                onClick={handleChangePlan}
                disabled={selectedPlanId === subscription.planId}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${
                  selectedPlanId !== subscription.planId
                    ? 'bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] hover:shadow-lg hover:shadow-[#C9A961]/20 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <i className="ri-exchange-line"></i>
                Plan wechseln
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== KÜNDIGUNGS MODAL ===== */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line text-red-400 text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Abo wirklich kündigen?</h2>
                <p className="text-gray-400 text-sm">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <ul className="space-y-2 text-sm text-red-300">
                <li className="flex items-start gap-2"><i className="ri-close-circle-line mt-0.5"></i><span>Alle verbleibenden Credits verfallen</span></li>
                <li className="flex items-start gap-2"><i className="ri-close-circle-line mt-0.5"></i><span>Downgrade auf Free Plan</span></li>
                <li className="flex items-start gap-2"><i className="ri-close-circle-line mt-0.5"></i><span>Verlust aller Premium-Features</span></li>
              </ul>
            </div>
            <div className="bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-lg p-4 mb-6">
              <p className="text-[#C9A961] text-sm font-medium mb-2">Alternativ: Abo pausieren?</p>
              <p className="text-gray-400 text-xs mb-3">Pausiere dein Abo stattdessen und behalte deine Daten.</p>
              <button
                onClick={() => { setShowCancelModal(false); }}
                className="px-4 py-2.5 bg-[#C9A961]/20 text-[#C9A961] rounded-lg text-sm font-medium hover:bg-[#C9A961]/30 transition-all cursor-pointer whitespace-nowrap"
              >
                Lieber pausieren
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Kündigungsgrund</label>
                <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm cursor-pointer">
                  <option value="">Bitte auswählen...</option>
                  <option value="too_expensive">Zu teuer</option>
                  <option value="not_using">Nutze es nicht genug</option>
                  <option value="missing_features">Fehlende Features</option>
                  <option value="found_alternative">Alternative gefunden</option>
                  <option value="other">Sonstiges</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Bestätigung: Gib &quot;KÜNDIGEN&quot; ein *</label>
                <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="KÜNDIGEN" className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowCancelModal(false); setConfirmText(''); setCancelReason(''); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm font-medium text-white hover:border-[#3D3428]/50 transition-all cursor-pointer whitespace-nowrap">
                Abbrechen
              </button>
              <button onClick={handleCancelSubscription} disabled={confirmText !== 'KÜNDIGEN'} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${confirmText === 'KÜNDIGEN' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'}`}>
                <i className="ri-close-circle-line"></i>
                Jetzt kündigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddCardModal(false)}>
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Neue Karte hinzufügen</h2>
              <button onClick={() => setShowAddCardModal(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Karteninhaber *</label>
                <input type="text" value={newCard.holderName} onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })} placeholder="Max Mustermann" className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Kartennummer *</label>
                <input type="text" value={newCard.number} onChange={(e) => setNewCard({ ...newCard, number: formatCardNumber(e.target.value) })} placeholder="1234 5678 9012 3456" maxLength={19} className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Gültig bis *</label>
                  <input type="text" value={newCard.expiry} onChange={(e) => setNewCard({ ...newCard, expiry: formatExpiry(e.target.value) })} placeholder="MM/YY" maxLength={5} className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">CVC *</label>
                  <input type="text" value={newCard.cvc} onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="123" maxLength={4} className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm font-mono" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddCardModal(false)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm font-medium text-white hover:border-[#3D3428]/50 transition-all cursor-pointer whitespace-nowrap">
                Abbrechen
              </button>
              <button onClick={handleAddCard} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap">
                <i className="ri-add-line"></i>
                Karte hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change card modal */}
      {showChangeCardModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowChangeCardModal(false)}>
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">Zahlungsmethode wählen</h2>
            <div className="space-y-3">
              {cards.map(card => (
                <button
                  key={card.id}
                  onClick={() => { handleSetDefaultCard(card.id); setShowChangeCardModal(false); }}
                  className={`w-full p-4 rounded-lg border text-left transition-all cursor-pointer ${
                    card.isDefault ? 'border-[#C9A961] bg-[#C9A961]/10' : 'border-[#3D3428]/30 bg-[#0F1419] hover:border-[#3D3428]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`${getCardIcon(card.type)} text-xl text-white`}></i>
                    <span className="text-white text-sm">{card.type} •••• {card.last4}</span>
                    {card.isDefault && <span className="ml-auto text-[#C9A961] text-xs font-semibold">Aktiv</span>}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowChangeCardModal(false)} className="w-full mt-4 px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white cursor-pointer whitespace-nowrap">
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
