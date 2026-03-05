import { useState, useEffect } from 'react';
import { defaultInvoiceSettings } from '../../../../../mocks/invoiceSettings';

interface InvoiceTranslations {
  invoice: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  from: string;
  to: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  subtotal: string;
  tax: string;
  total: string;
  paymentInfo: string;
  bankDetails: string;
  page: string;
  of: string;
  vatId: string;
  customerNumber: string;
  orderNumber: string;
  deliveryDate: string;
  paymentMethod: string;
}

interface InvoiceSettings {
  companyName: string;
  companySlogan: string;
  companyStreet: string;
  companyZip: string;
  companyCity: string;
  companyCountry: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;
  companyVatId: string;
  companyRegistration: string;
  logoInitials: string;
  logoUrl: string;
  headerBgColor: string;
  accentColor: string;
  accentColorRgb: [number, number, number];
  headerBgColorRgb: [number, number, number];
  taxRate: number;
  taxLabel: string;
  currency: string;
  footerLine1: string;
  footerLine2: string;
  paymentTerms: string;
  bankName: string;
  iban: string;
  bic: string;
  accountHolder: string;
  invoicePrefix: string;
  thankYouText: string;
  notes: string;
  language: string;
  translations: Record<string, InvoiceTranslations>;
  showQuantityColumn: boolean;
  showUnitPriceColumn: boolean;
  showCustomerNumber: boolean;
  showOrderNumber: boolean;
  showDeliveryDate: boolean;
  showDueDate: boolean;
  showPaymentMethod: boolean;
  defaultPaymentMethod: string;
  dueDays: number;
  showDiscount: boolean;
  discountLabel: string;
  showSecondTax: boolean;
  secondTaxRate: number;
  secondTaxLabel: string;
  legalNotice: string;
  showQrCode: boolean;
  qrCodeType: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

const languageOptions = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' }
];

export default function InvoiceEditor() {
  const [settings, setSettings] = useState<InvoiceSettings>(defaultInvoiceSettings as InvoiceSettings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('company');
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('invoiceSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error('Failed to load invoice settings:', e);
    }
  }, []);

  const handleSave = () => {
    try {
      const toSave = {
        ...settings,
        accentColorRgb: hexToRgb(settings.accentColor),
        headerBgColorRgb: hexToRgb(settings.headerBgColor)
      };
      localStorage.setItem('invoiceSettings', JSON.stringify(toSave));
      window.dispatchEvent(new Event('invoiceSettingsUpdated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Failed to save invoice settings:', e);
    }
  };

  const handleReset = () => {
    setSettings(defaultInvoiceSettings as InvoiceSettings);
    localStorage.removeItem('invoiceSettings');
    setSaved(false);
  };

  const updateField = (key: keyof InvoiceSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateTranslation = (lang: string, key: keyof InvoiceTranslations, value: string) => {
    setSettings(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [key]: value
        }
      }
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Die Datei ist zu groß. Maximal 2 MB erlaubt.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Bitte nur Bilddateien hochladen (PNG, JPG, JPEG, SVG).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateField('logoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    updateField('logoUrl', '');
  };

  const currentTranslations = settings.translations[settings.language] || settings.translations.de;

  const sections = [
    { id: 'company', label: 'Firmendaten', icon: 'ri-building-line' },
    { id: 'design', label: 'Design & Farben', icon: 'ri-palette-line' },
    { id: 'language', label: 'Sprache', icon: 'ri-translate-2' },
    { id: 'tax', label: 'Steuern & Währung', icon: 'ri-percent-line' },
    { id: 'payment', label: 'Zahlungsinfos', icon: 'ri-bank-line' },
    { id: 'fields', label: 'Zusätzliche Felder', icon: 'ri-list-settings-line' },
    { id: 'texts', label: 'Texte & Notizen', icon: 'ri-file-text-line' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Rechnungs-Vorlage</h3>
          <p className="text-slate-400 text-sm mt-1">
            Gestalte die PDF-Rechnungen, die Benutzer herunterladen können
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewVisible(!previewVisible)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className={previewVisible ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
            {previewVisible ? 'Vorschau ausblenden' : 'Vorschau'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-refresh-line"></i> Zurücksetzen
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              saved
                ? 'bg-emerald-500 text-white'
                : 'bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419]'
            }`}
          >
            <i className={saved ? 'ri-check-line' : 'ri-save-line'}></i>
            {saved ? 'Gespeichert!' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700 flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2.5 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSection === s.id
                ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <i className={s.icon}></i>
            {s.label}
          </button>
        ))}
      </div>

      {/* ===== FIRMENDATEN ===== */}
      {activeSection === 'company' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-5">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
            <i className="ri-building-line text-[#C9A961]"></i> Firmendaten auf der Rechnung
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Firmenname *</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={e => updateField('companyName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Slogan / Untertitel</label>
              <input
                type="text"
                value={settings.companySlogan}
                onChange={e => updateField('companySlogan', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Straße & Hausnummer *</label>
            <input
              type="text"
              value={settings.companyStreet}
              onChange={e => updateField('companyStreet', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">PLZ *</label>
              <input
                type="text"
                value={settings.companyZip}
                onChange={e => updateField('companyZip', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Stadt *</label>
              <input
                type="text"
                value={settings.companyCity}
                onChange={e => updateField('companyCity', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Land *</label>
              <input
                type="text"
                value={settings.companyCountry}
                onChange={e => updateField('companyCountry', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">E-Mail *</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={e => updateField('companyEmail', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Telefon</label>
              <input
                type="text"
                value={settings.companyPhone}
                onChange={e => updateField('companyPhone', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Website</label>
              <input
                type="text"
                value={settings.companyWebsite}
                onChange={e => updateField('companyWebsite', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">USt-IdNr. *</label>
              <input
                type="text"
                value={settings.companyVatId}
                onChange={e => updateField('companyVatId', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="CHE-XXX.XXX.XXX"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Handelsregister-Nr.</label>
              <input
                type="text"
                value={settings.companyRegistration}
                onChange={e => updateField('companyRegistration', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="HRB 12345"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== DESIGN ===== */}
      {activeSection === 'design' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-5">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
            <i className="ri-palette-line text-[#C9A961]"></i> Design & Farben
          </h4>
          
          {/* Logo Upload */}
          <div>
            <label className="text-slate-400 text-xs mb-2 block">Firmen-Logo</label>
            <div className="flex items-start gap-4">
              {/* Logo Preview */}
              <div className="flex-shrink-0">
                {settings.logoUrl ? (
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-lg border-2 border-slate-600 bg-white p-2 flex items-center justify-center">
                      <img 
                        src={settings.logoUrl} 
                        alt="Logo" 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <button
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Logo entfernen"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center bg-slate-900">
                    <i className="ri-image-line text-slate-500 text-2xl"></i>
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap">
                  <i className="ri-upload-2-line"></i>
                  {settings.logoUrl ? 'Logo ändern' : 'Logo hochladen'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-slate-500 text-xs mt-2">
                  Empfohlen: PNG oder JPG, max. 2 MB<br/>
                  Quadratisches Format für beste Darstellung
                </p>
                {settings.logoUrl && (
                  <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                    <i className="ri-check-line"></i> Logo hochgeladen und wird in allen Rechnungen verwendet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fallback: Logo-Kürzel */}
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              Logo-Kürzel (Fallback, wenn kein Logo hochgeladen)
            </label>
            <input
              type="text"
              value={settings.logoInitials}
              onChange={e => updateField('logoInitials', e.target.value.slice(0, 3))}
              maxLength={3}
              className="w-32 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] text-center font-bold text-lg"
            />
            <p className="text-slate-500 text-xs mt-1">
              Wird nur angezeigt, wenn kein Logo hochgeladen wurde
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-slate-400 text-xs mb-2 block">Header-Hintergrundfarbe</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.headerBgColor}
                  onChange={e => updateField('headerBgColor', e.target.value)}
                  className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600"
                />
                <input
                  type="text"
                  value={settings.headerBgColor}
                  onChange={e => updateField('headerBgColor', e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-2 block">Akzentfarbe (Logo, Linien)</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={e => updateField('accentColor', e.target.value)}
                  className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600"
                />
                <input
                  type="text"
                  value={settings.accentColor}
                  onChange={e => updateField('accentColor', e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
            </div>
          </div>
          
          {/* Mini Preview */}
          <div className="mt-4">
            <p className="text-slate-400 text-xs mb-3">Vorschau Header-Bereich:</p>
            <div className="rounded-lg overflow-hidden" style={{ maxWidth: 400 }}>
              <div className="p-4 flex items-center gap-3" style={{ backgroundColor: settings.headerBgColor }}>
                {settings.logoUrl ? (
                  <div className="w-10 h-10 rounded bg-white p-1 flex items-center justify-center">
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: settings.accentColor, color: settings.headerBgColor }}
                  >
                    {settings.logoInitials}
                  </div>
                )}
                <div>
                  <div className="text-white text-sm font-bold">{settings.companyName}</div>
                  <div className="text-xs" style={{ color: settings.accentColor }}>{settings.companySlogan}</div>
                </div>
                <div className="ml-auto text-white text-xs font-bold">{currentTranslations.invoice}</div>
              </div>
              <div className="h-1" style={{ backgroundColor: settings.accentColor }}></div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SPRACHE ===== */}
      {activeSection === 'language' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-5">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
            <i className="ri-translate-2 text-[#C9A961]"></i> Sprache & Übersetzungen
          </h4>
          
          {/* Sprachauswahl */}
          <div>
            <label className="text-slate-400 text-xs mb-2 block">Standard-Sprache für Rechnungen</label>
            <div className="flex gap-2 flex-wrap">
              {languageOptions.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => updateField('language', lang.code)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    settings.language === lang.code
                      ? 'bg-[#C9A961] text-[#0F1419]'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Übersetzungen bearbeiten */}
          <div className="border-t border-slate-700 pt-5">
            <h5 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
              <i className="ri-edit-line text-[#C9A961]"></i>
              Texte für {languageOptions.find(l => l.code === settings.language)?.label} anpassen
            </h5>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Titel "Rechnung"</label>
                <input
                  type="text"
                  value={currentTranslations.invoice}
                  onChange={e => updateTranslation(settings.language, 'invoice', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Rechnungsnummer</label>
                <input
                  type="text"
                  value={currentTranslations.invoiceNumber}
                  onChange={e => updateTranslation(settings.language, 'invoiceNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Rechnungsdatum</label>
                <input
                  type="text"
                  value={currentTranslations.invoiceDate}
                  onChange={e => updateTranslation(settings.language, 'invoiceDate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Fälligkeitsdatum</label>
                <input
                  type="text"
                  value={currentTranslations.dueDate}
                  onChange={e => updateTranslation(settings.language, 'dueDate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">"Von"</label>
                <input
                  type="text"
                  value={currentTranslations.from}
                  onChange={e => updateTranslation(settings.language, 'from', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">"An"</label>
                <input
                  type="text"
                  value={currentTranslations.to}
                  onChange={e => updateTranslation(settings.language, 'to', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Beschreibung</label>
                <input
                  type="text"
                  value={currentTranslations.description}
                  onChange={e => updateTranslation(settings.language, 'description', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Menge</label>
                <input
                  type="text"
                  value={currentTranslations.quantity}
                  onChange={e => updateTranslation(settings.language, 'quantity', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Einzelpreis</label>
                <input
                  type="text"
                  value={currentTranslations.unitPrice}
                  onChange={e => updateTranslation(settings.language, 'unitPrice', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Betrag</label>
                <input
                  type="text"
                  value={currentTranslations.amount}
                  onChange={e => updateTranslation(settings.language, 'amount', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Zwischensumme</label>
                <input
                  type="text"
                  value={currentTranslations.subtotal}
                  onChange={e => updateTranslation(settings.language, 'subtotal', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Steuer (MwSt.)</label>
                <input
                  type="text"
                  value={currentTranslations.tax}
                  onChange={e => updateTranslation(settings.language, 'tax', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Gesamt</label>
                <input
                  type="text"
                  value={currentTranslations.total}
                  onChange={e => updateTranslation(settings.language, 'total', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Zahlungsinformationen</label>
                <input
                  type="text"
                  value={currentTranslations.paymentInfo}
                  onChange={e => updateTranslation(settings.language, 'paymentInfo', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Kundennummer</label>
                <input
                  type="text"
                  value={currentTranslations.customerNumber}
                  onChange={e => updateTranslation(settings.language, 'customerNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Bestellnummer</label>
                <input
                  type="text"
                  value={currentTranslations.orderNumber}
                  onChange={e => updateTranslation(settings.language, 'orderNumber', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Zahlungsart</label>
                <input
                  type="text"
                  value={currentTranslations.paymentMethod}
                  onChange={e => updateTranslation(settings.language, 'paymentMethod', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Lieferdatum</label>
                <input
                  type="text"
                  value={currentTranslations.deliveryDate}
                  onChange={e => updateTranslation(settings.language, 'deliveryDate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-slate-700/30 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <i className="ri-lightbulb-line text-[#C9A961] text-lg mt-0.5"></i>
              <div>
                <p className="text-slate-300 text-sm">
                  Die gewählte Sprache wird für alle Rechnungstexte verwendet. Du kannst die Übersetzungen individuell anpassen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== STEUERN ===== */}
      {activeSection === 'tax' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-5">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
            <i className="ri-percent-line text-[#C9A961]"></i> Steuern & Währung
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Währung *</label>
              <select
                value={settings.currency}
                onChange={e => updateField('currency', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] cursor-pointer"
              >
                <option value="CHF">CHF (Schweizer Franken)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (US-Dollar)</option>
                <option value="GBP">GBP (Britisches Pfund)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Steuersatz (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings.taxRate}
                onChange={e => updateField('taxRate', parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Steuer-Bezeichnung</label>
              <input
                type="text"
                value={settings.taxLabel}
                onChange={e => updateField('taxLabel', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="MwSt."
              />
            </div>
          </div>

          {/* Zweite Steuerzeile */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showSecondTax}
                  onChange={e => updateField('showSecondTax', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
              </label>
              <span className="text-slate-300 text-sm">Zweite Steuerzeile anzeigen</span>
            </div>
            {settings.showSecondTax && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Zweiter Steuersatz (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.secondTaxRate}
                    onChange={e => updateField('secondTaxRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Bezeichnung</label>
                  <input
                    type="text"
                    value={settings.secondTaxLabel}
                    onChange={e => updateField('secondTaxLabel', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    placeholder="z.B. Reduzierte MwSt."
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">Rechnungsnummer-Präfix</label>
            <input
              type="text"
              value={settings.invoicePrefix}
              onChange={e => updateField('invoicePrefix', e.target.value)}
              className="w-48 bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              placeholder="INV"
            />
            <p className="text-slate-500 text-xs mt-1">Beispiel: {settings.invoicePrefix}-2025-001</p>
          </div>
        </div>
      )}

      {/* ===== ZAHLUNGSINFOS ===== */}
      {activeSection === 'payment' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-5">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
            <i className="ri-bank-line text-[#C9A961]"></i> Zahlungsinformationen
          </h4>
          <p className="text-slate-400 text-xs">Diese Infos erscheinen optional auf der Rechnung</p>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Zahlungsbedingungen</label>
            <input
              type="text"
              value={settings.paymentTerms}
              onChange={e => updateField('paymentTerms', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              placeholder="Zahlbar innerhalb von 30 Tagen"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Bankname</label>
              <input
                type="text"
                value={settings.bankName}
                onChange={e => updateField('bankName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="z.B. UBS"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Kontoinhaber</label>
              <input
                type="text"
                value={settings.accountHolder}
                onChange={e => updateField('accountHolder', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="IdeaOracle AG"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">IBAN</label>
              <input
                type="text"
                value={settings.iban}
                onChange={e => updateField('iban', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="CH00 0000 0000 0000 0000 0"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">BIC / SWIFT</label>
              <input
                type="text"
                value={settings.bic}
                onChange={e => updateField('bic', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="UBSWCHZH"
              />
            </div>
          </div>

          {/* QR-Code Option */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showQrCode}
                  onChange={e => updateField('showQrCode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
              </label>
              <span className="text-slate-300 text-sm">QR-Code für Zahlung anzeigen</span>
            </div>
            {settings.showQrCode && (
              <div>
                <label className="text-slate-400 text-xs mb-1 block">QR-Code Typ</label>
                <select
                  value={settings.qrCodeType}
                  onChange={e => updateField('qrCodeType', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] cursor-pointer"
                >
                  <option value="swiss-qr">Swiss QR-Rechnung</option>
                  <option value="sepa">SEPA QR-Code</option>
                </select>
                <p className="text-slate-500 text-xs mt-1">
                  Der QR-Code wird automatisch aus den Bankdaten generiert
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ZUSÄTZLICHE FELDER ===== */}
      {activeSection === 'fields' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-5">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
            <i className="ri-list-settings-line text-[#C9A961]"></i> Zusätzliche Felder
          </h4>
          <p className="text-slate-400 text-xs mb-4">Wähle aus, welche zusätzlichen Informationen auf der Rechnung erscheinen sollen</p>

          {/* Spalten-Optionen */}
          <div className="space-y-3">
            <h5 className="text-slate-300 text-sm font-medium">Tabellen-Spalten</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showQuantityColumn}
                    onChange={e => updateField('showQuantityColumn', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
                </label>
                <span className="text-slate-300 text-sm">Menge-Spalte anzeigen</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showUnitPriceColumn}
                    onChange={e => updateField('showUnitPriceColumn', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
                </label>
                <span className="text-slate-300 text-sm">Einzelpreis-Spalte anzeigen</span>
              </div>
            </div>
          </div>

          {/* Zusätzliche Info-Felder */}
          <div className="space-y-3 border-t border-slate-700 pt-4">
            <h5 className="text-slate-300 text-sm font-medium">Zusätzliche Informationen</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showCustomerNumber}
                    onChange={e => updateField('showCustomerNumber', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
                </label>
                <span className="text-slate-300 text-sm">Kundennummer anzeigen</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showOrderNumber}
                    onChange={e => updateField('showOrderNumber', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
                </label>
                <span className="text-slate-300 text-sm">Bestellnummer anzeigen</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showDeliveryDate}
                    onChange={e => updateField('showDeliveryDate', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
                </label>
                <span className="text-slate-300 text-sm">Lieferdatum anzeigen</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showDueDate}
                    onChange={e => updateField('showDueDate', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
                </label>
                <span className="text-slate-300 text-sm">Fälligkeitsdatum anzeigen</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showPaymentMethod}
                    onChange={e => updateField('showPaymentMethod', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
                </label>
                <span className="text-slate-300 text-sm">Zahlungsart anzeigen</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showDiscount}
                    onChange={e => updateField('showDiscount', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A961]"></div>
                </label>
                <span className="text-slate-300 text-sm">Rabatt-Zeile anzeigen</span>
              </div>
            </div>
          </div>

          {/* Zusätzliche Einstellungen */}
          <div className="space-y-4 border-t border-slate-700 pt-4">
            <h5 className="text-slate-300 text-sm font-medium">Standardwerte</h5>
            <div className="grid grid-cols-2 gap-4">
              {settings.showPaymentMethod && (
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Standard-Zahlungsart</label>
                  <input
                    type="text"
                    value={settings.defaultPaymentMethod}
                    onChange={e => updateField('defaultPaymentMethod', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    placeholder="z.B. Kreditkarte, Überweisung"
                  />
                </div>
              )}
              {settings.showDueDate && (
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Zahlungsziel (Tage)</label>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={settings.dueDays}
                    onChange={e => updateField('dueDays', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                  />
                </div>
              )}
              {settings.showDiscount && (
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Rabatt-Bezeichnung</label>
                  <input
                    type="text"
                    value={settings.discountLabel}
                    onChange={e => updateField('discountLabel', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    placeholder="z.B. Rabatt, Skonto"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== TEXTE ===== */}
      {activeSection === 'texts' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-5">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-2">
            <i className="ri-file-text-line text-[#C9A961]"></i> Texte & Notizen
          </h4>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Dankeschön-Text</label>
            <input
              type="text"
              value={settings.thankYouText}
              onChange={e => updateField('thankYouText', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
              placeholder="Vielen Dank für Ihr Vertrauen!"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Fußzeile Zeile 1 (optional)</label>
              <input
                type="text"
                value={settings.footerLine1}
                onChange={e => updateField('footerLine1', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="Wird automatisch generiert wenn leer"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Fußzeile Zeile 2 (optional)</label>
              <input
                type="text"
                value={settings.footerLine2}
                onChange={e => updateField('footerLine2', e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                placeholder="Wird automatisch generiert wenn leer"
              />
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Rechtlicher Hinweis</label>
            <textarea
              value={settings.legalNotice}
              onChange={e => updateField('legalNotice', e.target.value.slice(0, 500))}
              maxLength={500}
              rows={2}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
              placeholder="z.B. Kleinunternehmerregelung, Reverse Charge..."
            />
            <p className="text-slate-500 text-xs mt-1">{settings.legalNotice.length}/500 Zeichen</p>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Zusätzliche Notizen (erscheint auf der Rechnung)</label>
            <textarea
              value={settings.notes}
              onChange={e => updateField('notes', e.target.value.slice(0, 500))}
              maxLength={500}
              rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
              placeholder="z.B. Sonderbedingungen, Hinweise..."
            />
            <p className="text-slate-500 text-xs mt-1">{settings.notes.length}/500 Zeichen</p>
          </div>
        </div>
      )}

      {/* ===== VORSCHAU ===== */}
      {previewVisible && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h4 className="text-white font-semibold flex items-center gap-2 mb-4">
            <i className="ri-file-pdf-2-line text-[#C9A961]"></i> PDF-Vorschau ({languageOptions.find(l => l.code === settings.language)?.label})
          </h4>
          <div className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-lg mx-auto">
            {/* Header */}
            <div className="p-5 flex items-center justify-between" style={{ backgroundColor: settings.headerBgColor }}>
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <div className="w-10 h-10 rounded bg-white p-1 flex items-center justify-center">
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: settings.accentColor, color: settings.headerBgColor }}
                  >
                    {settings.logoInitials}
                  </div>
                )}
                <div>
                  <div className="text-white text-sm font-bold">{settings.companyName}</div>
                  <div className="text-xs" style={{ color: settings.accentColor }}>{settings.companySlogan}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-xs font-bold">{currentTranslations.invoice}</div>
                <div className="text-gray-400 text-xs">{settings.invoicePrefix}-2025-001</div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Addresses */}
              <div className="flex justify-between text-xs">
                <div>
                  <div className="text-gray-400 font-bold text-[10px] uppercase mb-1">{currentTranslations.from}</div>
                  <div className="text-gray-700">{settings.companyName}</div>
                  <div className="text-gray-500">{settings.companyStreet}</div>
                  <div className="text-gray-500">{settings.companyZip} {settings.companyCity}</div>
                  <div className="text-gray-500">{currentTranslations.vatId}: {settings.companyVatId}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 font-bold text-[10px] uppercase mb-1">{currentTranslations.to}</div>
                  <div className="text-gray-700">Max Mustermann</div>
                  <div className="text-gray-500">Startup GmbH</div>
                  <div className="text-gray-500">Musterstraße 123</div>
                  <div className="text-gray-500">8001 Zürich</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <div>
                  <span className="text-gray-400">{currentTranslations.invoiceDate}:</span> 15.01.2025
                </div>
                {settings.showDueDate && (
                  <div>
                    <span className="text-gray-400">{currentTranslations.dueDate}:</span> 14.02.2025
                  </div>
                )}
                {settings.showCustomerNumber && (
                  <div>
                    <span className="text-gray-400">{currentTranslations.customerNumber}:</span> K-12345
                  </div>
                )}
                {settings.showOrderNumber && (
                  <div>
                    <span className="text-gray-400">{currentTranslations.orderNumber}:</span> B-67890
                  </div>
                )}
                {settings.showPaymentMethod && (
                  <div>
                    <span className="text-gray-400">{currentTranslations.paymentMethod}:</span> {settings.defaultPaymentMethod}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Table */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase bg-gray-50 px-3 py-2 rounded">
                  <span className="flex-1">{currentTranslations.description}</span>
                  {settings.showQuantityColumn && <span className="w-16 text-center">{currentTranslations.quantity}</span>}
                  {settings.showUnitPriceColumn && <span className="w-20 text-right">{currentTranslations.unitPrice}</span>}
                  <span className="w-20 text-right">{currentTranslations.amount}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-700 px-3 py-2">
                  <span className="flex-1">Pro Plan - Monatlich</span>
                  {settings.showQuantityColumn && <span className="w-16 text-center">1</span>}
                  {settings.showUnitPriceColumn && <span className="w-20 text-right">{settings.currency} 55.29</span>}
                  <span className="w-20 text-right">{settings.currency} 55.29</span>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-2 space-y-1 text-xs text-right">
                <div className="flex justify-end gap-8">
                  <span className="text-gray-500">{currentTranslations.subtotal}:</span>
                  <span className="text-gray-700">{settings.currency} 55.29</span>
                </div>
                {settings.showDiscount && (
                  <div className="flex justify-end gap-8">
                    <span className="text-gray-500">{settings.discountLabel}:</span>
                    <span className="text-emerald-600">- {settings.currency} 0.00</span>
                  </div>
                )}
                <div className="flex justify-end gap-8">
                  <span className="text-gray-500">{settings.taxLabel} ({settings.taxRate}%):</span>
                  <span className="text-gray-700">{settings.currency} 4.26</span>
                </div>
                {settings.showSecondTax && settings.secondTaxRate > 0 && (
                  <div className="flex justify-end gap-8">
                    <span className="text-gray-500">{settings.secondTaxLabel} ({settings.secondTaxRate}%):</span>
                    <span className="text-gray-700">{settings.currency} 0.00</span>
                  </div>
                )}
                <div className="pt-1 border-t" style={{ borderColor: settings.accentColor }}>
                  <div className="flex justify-end gap-8 font-bold text-sm">
                    <span className="text-gray-800">{currentTranslations.total}:</span>
                    <span className="text-gray-900">{settings.currency} 59.55</span>
                  </div>
                </div>
              </div>

              {/* Payment info */}
              {(settings.paymentTerms || settings.bankName) && (
                <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
                  <div className="font-medium text-gray-700">{currentTranslations.paymentInfo}</div>
                  {settings.paymentTerms && <div>{settings.paymentTerms}</div>}
                  {settings.bankName && (
                    <div>
                      {currentTranslations.bankDetails}: {settings.bankName}
                      {settings.accountHolder && ` | ${settings.accountHolder}`}
                      {settings.iban && ` | IBAN: ${settings.iban}`}
                      {settings.bic && ` | BIC: ${settings.bic}`}
                    </div>
                  )}
                </div>
              )}

              {/* Legal Notice */}
              {settings.legalNotice && (
                <div className="text-xs text-gray-400 italic border-l-2 pl-3" style={{ borderColor: settings.accentColor }}>
                  {settings.legalNotice}
                </div>
              )}

              {/* Thank you */}
              {settings.thankYouText && (
                <div className="text-center text-xs font-medium" style={{ color: settings.accentColor }}>
                  {settings.thankYouText}
                </div>
              )}

              {/* Notes */}
              {settings.notes && (
                <div className="text-xs text-gray-400 italic">{settings.notes}</div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-5 py-3 text-center text-[10px] text-gray-400">
              <div>
                {settings.footerLine1 || `${settings.companyName} | ${settings.companyStreet}, ${settings.companyZip} ${settings.companyCity} | ${settings.companyEmail}`}
              </div>
              <div>
                {settings.footerLine2 || `${settings.companyWebsite} | ${currentTranslations.vatId}: ${settings.companyVatId}`}
              </div>
            </div>
            <div className="h-1.5" style={{ backgroundColor: settings.accentColor }}></div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-[#C9A961] text-xl mt-0.5"></i>
          <div>
            <h3 className="text-[#C9A961] font-semibold text-sm mb-1">Automatische Verknüpfung</h3>
            <p className="text-slate-400 text-xs">
              Alle Änderungen hier werden automatisch auf die PDF-Rechnungen angewendet, die Benutzer im Dashboard unter &quot;Abo &amp; Zahlung &rarr; Zahlungshistorie&quot; herunterladen können.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
