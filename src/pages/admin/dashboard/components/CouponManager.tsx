import { useState, useEffect } from 'react';

interface RegistrationCoupon {
  id: string;
  code: string;
  category: 'registration';
  type: string;
  plan: 'starter' | 'pro' | 'builder' | 'all';
  discount?: number;
  bonusCredits?: number;
  duration?: number;
  durationUnit?: 'days' | 'months';
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  isActive: boolean;
}

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

const defaultRegistrationCoupons: RegistrationCoupon[] = [
  {
    id: '1',
    code: 'WELCOME50',
    category: 'registration',
    type: 'Rabatt',
    plan: 'starter',
    discount: 50,
    maxUses: 100,
    usedCount: 23,
    expiresAt: '2025-12-31',
    duration: 30,
    durationUnit: 'days',
    createdAt: '2025-01-15',
    isActive: true
  },
  {
    id: '2',
    code: 'CREDITS500',
    category: 'registration',
    type: 'Credits',
    plan: 'pro',
    bonusCredits: 500,
    maxUses: 50,
    usedCount: 12,
    expiresAt: '2025-06-30',
    createdAt: '2025-01-10',
    isActive: true
  },
  {
    id: '3',
    code: 'ALLACCESS',
    category: 'registration',
    type: 'Universal',
    plan: 'all',
    discount: 25,
    maxUses: 0,
    usedCount: 89,
    expiresAt: null,
    createdAt: '2025-01-01',
    isActive: true
  }
];

const defaultTrialCoupons: TrialCoupon[] = [
  {
    id: '4',
    code: 'TESTDRIVE7',
    category: 'trial',
    credits: 100,
    duration: 7,
    durationUnit: 'days',
    maxUses: 1000,
    usedCount: 347,
    expiresAt: '2025-03-31',
    createdAt: '2025-01-20',
    isActive: true
  }
];

export default function CouponManager() {
  const [activeTab, setActiveTab] = useState<'registration' | 'trial'>('registration');
  const [registrationCoupons, setRegistrationCoupons] = useState<RegistrationCoupon[]>([]);
  const [trialCoupons, setTrialCoupons] = useState<TrialCoupon[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Registration Coupon Form
  const [newRegCoupon, setNewRegCoupon] = useState({
    code: '',
    type: '',
    plan: 'all' as 'starter' | 'pro' | 'builder' | 'all',
    discount: 0,
    bonusCredits: 0,
    maxUses: 0,
    expiresAt: '',
    noExpiry: true,
    unlimitedUses: true,
    duration: 0,
    durationUnit: 'days' as 'days' | 'months'
  });

  // Trial Coupon Form
  const [newTrialCoupon, setNewTrialCoupon] = useState({
    code: '',
    credits: 100,
    duration: 7,
    durationUnit: 'days' as 'days' | 'months',
    maxUses: 100,
    expiresAt: ''
  });

  // Berechne Ablaufdatum basierend auf Test-Dauer
  const calculateExpiryDate = (duration: number, unit: 'days' | 'months') => {
    const date = new Date();
    if (unit === 'days') {
      date.setDate(date.getDate() + duration);
    } else {
      date.setMonth(date.getMonth() + duration);
    }
    return date.toISOString().split('T')[0];
  };

  // Handler für Dauer-Änderung mit automatischer Ablaufdatum-Berechnung
  const handleTrialDurationChange = (duration: number) => {
    const newExpiresAt = calculateExpiryDate(duration, newTrialCoupon.durationUnit);
    setNewTrialCoupon(prev => ({ 
      ...prev, 
      duration,
      expiresAt: newExpiresAt
    }));
  };

  // Handler für Dauer-Einheit-Änderung mit automatischer Ablaufdatum-Berechnung
  const handleTrialDurationUnitChange = (unit: 'days' | 'months') => {
    const newExpiresAt = calculateExpiryDate(newTrialCoupon.duration, unit);
    setNewTrialCoupon(prev => ({ 
      ...prev, 
      durationUnit: unit,
      expiresAt: newExpiresAt
    }));
  };

  // Automatische Code-Generierung
  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `NF-${randomPart}`;
  };

  const handleOpenCreateModal = () => {
    const generatedCode = generateCode();
    if (activeTab === 'registration') {
      setNewRegCoupon({
        code: generatedCode,
        type: '',
        plan: 'all',
        discount: 0,
        bonusCredits: 0,
        maxUses: 0,
        expiresAt: '',
        noExpiry: true,
        unlimitedUses: true,
        duration: 0,
        durationUnit: 'days'
      });
    } else {
      // Berechne initiales Ablaufdatum basierend auf Standard-Dauer (7 Tage)
      const initialExpiresAt = calculateExpiryDate(7, 'days');
      setNewTrialCoupon({
        code: generatedCode,
        credits: 100,
        duration: 7,
        durationUnit: 'days',
        maxUses: 100,
        expiresAt: initialExpiresAt
      });
    }
    setShowCreateModal(true);
  };

  const handleRegenerateCode = () => {
    const newCode = generateCode();
    if (activeTab === 'registration') {
      setNewRegCoupon(prev => ({ ...prev, code: newCode }));
    } else {
      setNewTrialCoupon(prev => ({ ...prev, code: newCode }));
    }
  };

  // Load coupons from localStorage on mount
  useEffect(() => {
    const savedRegCoupons = localStorage.getItem('admin_registration_coupons');
    const savedTrialCoupons = localStorage.getItem('admin_trial_coupons');
    
    if (savedRegCoupons) {
      try {
        setRegistrationCoupons(JSON.parse(savedRegCoupons));
      } catch {
        setRegistrationCoupons(defaultRegistrationCoupons);
        localStorage.setItem('admin_registration_coupons', JSON.stringify(defaultRegistrationCoupons));
      }
    } else {
      setRegistrationCoupons(defaultRegistrationCoupons);
      localStorage.setItem('admin_registration_coupons', JSON.stringify(defaultRegistrationCoupons));
    }

    if (savedTrialCoupons) {
      try {
        setTrialCoupons(JSON.parse(savedTrialCoupons));
      } catch {
        setTrialCoupons(defaultTrialCoupons);
        localStorage.setItem('admin_trial_coupons', JSON.stringify(defaultTrialCoupons));
      }
    } else {
      setTrialCoupons(defaultTrialCoupons);
      localStorage.setItem('admin_trial_coupons', JSON.stringify(defaultTrialCoupons));
    }
    
    setIsLoaded(true);
  }, []);

  // Save coupons to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('admin_registration_coupons', JSON.stringify(registrationCoupons));
      localStorage.setItem('admin_trial_coupons', JSON.stringify(trialCoupons));
    }
  }, [registrationCoupons, trialCoupons, isLoaded]);

  const handleCreateRegistrationCoupon = () => {
    if (!newRegCoupon.code || !newRegCoupon.type.trim()) {
      alert('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    if (!newRegCoupon.noExpiry && !newRegCoupon.expiresAt) {
      alert('Bitte wähle ein Ablaufdatum oder aktiviere "Unbegrenzt gültig"');
      return;
    }

    if (registrationCoupons.some(c => c.code.toLowerCase() === newRegCoupon.code.toLowerCase()) ||
        trialCoupons.some(c => c.code.toLowerCase() === newRegCoupon.code.toLowerCase())) {
      alert('Dieser Gutschein-Code existiert bereits');
      return;
    }

    const coupon: RegistrationCoupon = {
      id: Date.now().toString(),
      code: newRegCoupon.code.toUpperCase(),
      category: 'registration',
      type: newRegCoupon.type.trim(),
      plan: newRegCoupon.plan,
      discount: newRegCoupon.discount > 0 ? newRegCoupon.discount : undefined,
      bonusCredits: newRegCoupon.bonusCredits > 0 ? newRegCoupon.bonusCredits : undefined,
      duration: newRegCoupon.duration > 0 ? newRegCoupon.duration : undefined,
      durationUnit: newRegCoupon.duration > 0 ? newRegCoupon.durationUnit : undefined,
      maxUses: newRegCoupon.unlimitedUses ? 0 : newRegCoupon.maxUses,
      usedCount: 0,
      expiresAt: newRegCoupon.noExpiry ? null : newRegCoupon.expiresAt,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true
    };

    setRegistrationCoupons([...registrationCoupons, coupon]);
    setShowCreateModal(false);
  };

  const handleCreateTrialCoupon = () => {
    if (!newTrialCoupon.code || !newTrialCoupon.expiresAt) {
      alert('Bitte fülle alle Pflichtfelder aus');
      return;
    }

    if (registrationCoupons.some(c => c.code.toLowerCase() === newTrialCoupon.code.toLowerCase()) ||
        trialCoupons.some(c => c.code.toLowerCase() === newTrialCoupon.code.toLowerCase())) {
      alert('Dieser Gutschein-Code existiert bereits');
      return;
    }

    const coupon: TrialCoupon = {
      id: Date.now().toString(),
      code: newTrialCoupon.code.toUpperCase(),
      category: 'trial',
      credits: newTrialCoupon.credits,
      duration: newTrialCoupon.duration,
      durationUnit: newTrialCoupon.durationUnit,
      maxUses: newTrialCoupon.maxUses,
      usedCount: 0,
      expiresAt: newTrialCoupon.expiresAt,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true
    };

    setTrialCoupons([...trialCoupons, coupon]);
    setShowCreateModal(false);
  };

  const handleDeleteRegistrationCoupon = (id: string) => {
    if (confirm('Möchtest du diesen Gutschein wirklich löschen?')) {
      setRegistrationCoupons(registrationCoupons.filter(c => c.id !== id));
    }
  };

  const handleDeleteTrialCoupon = (id: string) => {
    if (confirm('Möchtest du diesen Gutschein wirklich löschen?')) {
      setTrialCoupons(trialCoupons.filter(c => c.id !== id));
    }
  };

  const handleToggleRegistrationActive = (id: string) => {
    setRegistrationCoupons(registrationCoupons.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleToggleTrialActive = (id: string) => {
    setTrialCoupons(trialCoupons.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const getTypeColor = (type: string) => {
    if (!type) return 'bg-teal-100 text-teal-700';
    const lower = type.toLowerCase();
    if (lower.includes('rabatt') || lower.includes('discount')) return 'bg-amber-100 text-amber-700';
    if (lower.includes('credit')) return 'bg-green-100 text-green-700';
    if (lower.includes('upgrade')) return 'bg-rose-100 text-rose-700';
    if (lower.includes('test') || lower.includes('kostenlos') || lower.includes('free')) return 'bg-orange-100 text-orange-700';
    return 'bg-teal-100 text-teal-700';
  };

  const getPlanLabel = (plan: 'starter' | 'pro' | 'builder' | 'all') => {
    if (plan === 'all') return 'Alle Pakete';
    return plan === 'starter' ? 'Starter' : plan === 'pro' ? 'Pro' : 'Builder';
  };

  const getRegistrationValueDisplay = (coupon: RegistrationCoupon) => {
    const parts: string[] = [];
    if (coupon.discount && coupon.discount > 0) {
      parts.push(`${coupon.discount}% Rabatt`);
    }
    if (coupon.bonusCredits && coupon.bonusCredits > 0) {
      parts.push(`${coupon.bonusCredits} Credits`);
    }
    if (coupon.duration && coupon.duration > 0) {
      parts.push(`${coupon.duration} ${coupon.durationUnit === 'days' ? 'Tage' : 'Monate'} gratis`);
    }
    return parts.length > 0 ? parts.join(' • ') : '–';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gutschein-Verwaltung</h2>
          <p className="text-sm text-gray-600 mt-1">Erstelle und verwalte Gutschein-Codes</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer"
        >
          <i className="ri-add-line"></i>
          Neuer Gutschein
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('registration')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'registration'
              ? 'bg-white text-teal-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-vip-crown-line mr-2"></i>
          Registrierungs-Gutscheine
        </button>
        <button
          onClick={() => setActiveTab('trial')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'trial'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <i className="ri-time-line mr-2"></i>
          Test-Zugangs-Gutscheine
        </button>
      </div>

      {/* Registration Coupons Table */}
      {activeTab === 'registration' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wert</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verwendung</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gültig bis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erstellt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrationCoupons.map((coupon) => (
                <tr key={coupon.id} className={`hover:bg-gray-50 ${!coupon.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleRegistrationActive(coupon.id)}
                      className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${
                        coupon.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all ${
                        coupon.isActive ? 'left-5' : 'left-1'
                      }`}></div>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{coupon.code}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(coupon.code)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        title="Code kopieren"
                      >
                        <i className="ri-file-copy-line"></i>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(coupon.type)}`}>
                      {coupon.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${coupon.plan === 'all' ? 'text-teal-600 font-medium' : 'text-gray-900'}`}>
                      {getPlanLabel(coupon.plan)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRegistrationValueDisplay(coupon)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {coupon.maxUses === 0 ? (
                      <span className="text-sm text-teal-600 font-medium flex items-center gap-1">
                        <i className="ri-infinity-line"></i>
                        Unbegrenzt ({coupon.usedCount})
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-teal-600 h-2 rounded-full"
                            style={{ width: `${(coupon.usedCount / coupon.maxUses) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {coupon.usedCount}/{coupon.maxUses}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {coupon.expiresAt ? (
                      <span className="text-gray-600">{new Date(coupon.expiresAt).toLocaleDateString('de-DE')}</span>
                    ) : (
                      <span className="text-teal-600 font-medium flex items-center gap-1">
                        <i className="ri-infinity-line"></i>
                        Unbegrenzt
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(coupon.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeleteRegistrationCoupon(coupon.id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      title="Löschen"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trial Coupons Table */}
      {activeTab === 'trial' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dauer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verwendung</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gültig bis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erstellt</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trialCoupons.map((coupon) => (
                <tr key={coupon.id} className={`hover:bg-gray-50 ${!coupon.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleTrialActive(coupon.id)}
                      className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${
                        coupon.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all ${
                        coupon.isActive ? 'left-5' : 'left-1'
                      }`}></div>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{coupon.code}</code>
                      <button
                        onClick={() => navigator.clipboard.writeText(coupon.code)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        title="Code kopieren"
                      >
                        <i className="ri-file-copy-line"></i>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.credits} Credits
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {coupon.duration} {coupon.durationUnit === 'days' ? 'Tage' : 'Monate'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(coupon.usedCount / coupon.maxUses) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {coupon.usedCount}/{coupon.maxUses}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(coupon.expiresAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(coupon.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeleteTrialCoupon(coupon.id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      title="Löschen"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === 'registration' ? 'Registrierungs-Gutschein erstellen' : 'Test-Zugangs-Gutschein erstellen'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {activeTab === 'registration' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gutschein-Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRegCoupon.code}
                      onChange={(e) => setNewRegCoupon({ ...newRegCoupon, code: e.target.value.toUpperCase() })}
                      placeholder="z.B. NF-7X3K9M"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Neuen Code generieren"
                    >
                      <i className="ri-refresh-line"></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ *
                  </label>
                  <input
                    type="text"
                    value={newRegCoupon.type}
                    onChange={(e) => setNewRegCoupon({ ...newRegCoupon, type: e.target.value })}
                    placeholder="z.B. Rabatt, Credits, VIP..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paket
                  </label>
                  <select
                    value={newRegCoupon.plan}
                    onChange={(e) => setNewRegCoupon({ ...newRegCoupon, plan: e.target.value as 'starter' | 'pro' | 'builder' | 'all' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="all">Alle Pakete (Universal)</option>
                    <option value="starter">Nur Starter</option>
                    <option value="pro">Nur Pro</option>
                    <option value="builder">Nur Builder</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Wähle "Alle Pakete" für einen universellen Gutschein</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rabatt % (optional)
                  </label>
                  <input
                    type="number"
                    value={newRegCoupon.discount}
                    onChange={(e) => setNewRegCoupon({ ...newRegCoupon, discount: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    placeholder="z.B. 50 für 50% Rabatt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus-Credits (optional)
                  </label>
                  <input
                    type="number"
                    value={newRegCoupon.bonusCredits}
                    onChange={(e) => setNewRegCoupon({ ...newRegCoupon, bonusCredits: parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="z.B. 500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gratis-Dauer (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newRegCoupon.duration}
                      onChange={(e) => setNewRegCoupon({ ...newRegCoupon, duration: parseInt(e.target.value) || 0 })}
                      min="0"
                      placeholder="z.B. 30"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <select
                      value={newRegCoupon.durationUnit}
                      onChange={(e) => setNewRegCoupon({ ...newRegCoupon, durationUnit: e.target.value as 'days' | 'months' })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="days">Tage</option>
                      <option value="months">Monate</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">z.B. 30 Tage gratis nutzen</p>
                </div>

                {/* Unbegrenzte Einlösungen Toggle */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Unbegrenzte Einlösungen</label>
                      <p className="text-xs text-gray-500">Keine Limitierung der Nutzungen</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewRegCoupon({ ...newRegCoupon, unlimitedUses: !newRegCoupon.unlimitedUses })}
                      className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                        newRegCoupon.unlimitedUses ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${
                        newRegCoupon.unlimitedUses ? 'left-6' : 'left-0.5'
                      }`}></div>
                    </button>
                  </div>

                  {!newRegCoupon.unlimitedUses && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maximale Einlösungen
                      </label>
                      <input
                        type="number"
                        value={newRegCoupon.maxUses}
                        onChange={(e) => setNewRegCoupon({ ...newRegCoupon, maxUses: parseInt(e.target.value) || 100 })}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                {/* Unbegrenzte Gültigkeit Toggle */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Unbegrenzt gültig</label>
                      <p className="text-xs text-gray-500">Kein Ablaufdatum</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewRegCoupon({ ...newRegCoupon, noExpiry: !newRegCoupon.noExpiry })}
                      className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
                        newRegCoupon.noExpiry ? 'bg-teal-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${
                        newRegCoupon.noExpiry ? 'left-6' : 'left-0.5'
                      }`}></div>
                    </button>
                  </div>

                  {!newRegCoupon.noExpiry && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gültig bis
                      </label>
                      <input
                        type="date"
                        value={newRegCoupon.expiresAt}
                        onChange={(e) => setNewRegCoupon({ ...newRegCoupon, expiresAt: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gutschein-Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTrialCoupon.code}
                      onChange={(e) => setNewTrialCoupon({ ...newTrialCoupon, code: e.target.value.toUpperCase() })}
                      placeholder="z.B. NF-7X3K9M"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Neuen Code generieren"
                    >
                      <i className="ri-refresh-line"></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credits *
                  </label>
                  <input
                    type="number"
                    value={newTrialCoupon.credits}
                    onChange={(e) => setNewTrialCoupon({ ...newTrialCoupon, credits: parseInt(e.target.value) || 100 })}
                    min="1"
                    placeholder="z.B. 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Anzahl Credits für den Test-Zugang</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test-Dauer *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newTrialCoupon.duration}
                      onChange={(e) => handleTrialDurationChange(parseInt(e.target.value) || 7)}
                      min="1"
                      placeholder="z.B. 7"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <select
                      value={newTrialCoupon.durationUnit}
                      onChange={(e) => handleTrialDurationUnitChange(e.target.value as 'days' | 'months')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="days">Tage</option>
                      <option value="months">Monate</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Wie lange der Test-Zugang gültig ist</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximale Einlösungen *
                  </label>
                  <input
                    type="number"
                    value={newTrialCoupon.maxUses}
                    onChange={(e) => setNewTrialCoupon({ ...newTrialCoupon, maxUses: parseInt(e.target.value) || 100 })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gültig bis
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newTrialCoupon.expiresAt}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <i className="ri-lock-line text-gray-400"></i>
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <i className="ri-information-line"></i>
                    Wird automatisch aus der Test-Dauer berechnet
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={activeTab === 'registration' ? handleCreateRegistrationCoupon : handleCreateTrialCoupon}
                className={`flex-1 px-4 py-2 ${activeTab === 'registration' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-orange-600 hover:bg-orange-700'} text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer`}
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
