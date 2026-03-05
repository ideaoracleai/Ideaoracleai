import { useState, useEffect } from 'react';
import DowngradeModal from './DowngradeModal';
import { adminUsers } from '../../../../mocks/dashboardData';

interface PaymentMethod {
  type: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

interface BillingAddress {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  stripeId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
  credits: number;
  joinDate: string;
  lastActive: string;
  totalSpent: number;
  isBlocked?: boolean;
  isFree?: boolean;
  freeUntil?: string;
  subscriptionStatus: 'active' | 'cancelled' | 'overdue';
  cancelledAt?: string | null;
  cancelledEffectiveDate?: string | null;
  cancellationReason?: string | null;
  paymentMethod: PaymentMethod;
  billingAddress: BillingAddress;
  transactions: Transaction[];
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [freeMonths, setFreeMonths] = useState(1);
  const [freePlan, setFreePlan] = useState('Pro');
  const [successMessage, setSuccessMessage] = useState('');
  const [subscriptionAction, setSubscriptionAction] = useState<'cancel' | 'pause' | 'change' | 'reactivate'>('cancel');
  const [newPlan, setNewPlan] = useState('Pro');
  const [cancellationReason, setCancellationReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  useEffect(() => {
    setUsers(adminUsers as User[]);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Berechnet das Ende des aktuellen Monats
  const getEndOfMonth = () => {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return endOfMonth.toISOString().split('T')[0];
  };

  // Berechnet verbleibende Tage bis Monatsende
  const getDaysUntilEnd = (effectiveDate: string) => {
    const now = new Date();
    const end = new Date(effectiveDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'cancelled') return matchesSearch && user.subscriptionStatus === 'cancelled';
    if (statusFilter === 'active') return matchesSearch && user.subscriptionStatus === 'active';
    return matchesSearch;
  });

  const handleDowngrade = (user: User) => {
    setSelectedUser(user);
    setShowDowngradeModal(true);
    setActiveDropdown(null);
  };

  const handleFreeAccount = (user: User) => {
    setSelectedUser(user);
    setFreePlan(user.plan === 'Starter' ? 'Pro' : user.plan);
    setFreeMonths(1);
    setShowFreeModal(true);
    setActiveDropdown(null);
  };

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    setShowBlockModal(true);
    setActiveDropdown(null);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
    setActiveDropdown(null);
  };

  const handleManageSubscription = (user: User) => {
    setSelectedUser(user);
    setNewPlan(user.plan);
    setCancellationReason('');
    // Wenn bereits gekündigt, zeige Reaktivieren als Option
    if (user.subscriptionStatus === 'cancelled') {
      setSubscriptionAction('reactivate');
    } else {
      setSubscriptionAction('cancel');
    }
    setShowSubscriptionModal(true);
    setActiveDropdown(null);
  };

  const confirmFreeAccount = () => {
    if (!selectedUser) return;
    
    const freeUntilDate = new Date();
    freeUntilDate.setMonth(freeUntilDate.getMonth() + freeMonths);
    
    const updatedUser = {
      ...selectedUser,
      plan: freePlan,
      isFree: true,
      freeUntil: freeUntilDate.toISOString().split('T')[0],
      credits: freePlan === 'Builder' ? 50000 : freePlan === 'Pro' ? 10000 : 2500
    };
    
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowFreeModal(false);
    setSelectedUser(null);
    showSuccess(`${selectedUser.name} hat jetzt ${freeMonths} Monat(e) kostenloses ${freePlan}-Paket`);
  };

  const confirmBlockUser = () => {
    if (!selectedUser) return;
    
    const updatedUser = {
      ...selectedUser,
      isBlocked: !selectedUser.isBlocked
    };
    
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowBlockModal(false);
    setSelectedUser(null);
    showSuccess(updatedUser.isBlocked 
      ? `${selectedUser.name} wurde blockiert` 
      : `${selectedUser.name} wurde entsperrt`
    );
  };

  const removeFreeStatus = (user: User) => {
    const updatedUser = {
      ...user,
      isFree: false,
      freeUntil: undefined,
      plan: 'Starter',
      credits: 2500
    };
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    showSuccess(`Gratis-Status von ${user.name} wurde entfernt`);
    setActiveDropdown(null);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return 'ri-bank-card-line';
      case 'mastercard':
        return 'ri-mastercard-line';
      case 'amex':
        return 'ri-bank-card-2-line';
      default:
        return 'ri-bank-card-line';
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case 'visa':
        return 'text-blue-400';
      case 'mastercard':
        return 'text-orange-400';
      case 'amex':
        return 'text-emerald-400';
      default:
        return 'text-slate-400';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'overdue':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'cancelled':
        return 'Gekündigt';
      case 'overdue':
        return 'Pausiert';
      default:
        return 'Unbekannt';
    }
  };

  const confirmSubscriptionAction = () => {
    if (!selectedUser) return;
    
    let updatedUser = { ...selectedUser };
    let message = '';

    switch (subscriptionAction) {
      case 'cancel':
        const today = new Date().toISOString().split('T')[0];
        const endOfMonth = getEndOfMonth();
        updatedUser.subscriptionStatus = 'cancelled';
        updatedUser.cancelledAt = today;
        updatedUser.cancelledEffectiveDate = endOfMonth;
        updatedUser.cancellationReason = cancellationReason || 'Kein Grund angegeben';
        message = `Abo von ${selectedUser.name} wurde gekündigt (gültig bis ${new Date(endOfMonth).toLocaleDateString('de-CH')})`;
        break;
      case 'pause':
        updatedUser.subscriptionStatus = 'overdue';
        message = `Abo von ${selectedUser.name} wurde pausiert`;
        break;
      case 'change':
        updatedUser.plan = newPlan;
        updatedUser.subscriptionStatus = 'active';
        updatedUser.cancelledAt = null;
        updatedUser.cancelledEffectiveDate = null;
        updatedUser.cancellationReason = null;
        message = `Abo von ${selectedUser.name} wurde auf ${newPlan} geändert`;
        break;
      case 'reactivate':
        updatedUser.subscriptionStatus = 'active';
        updatedUser.cancelledAt = null;
        updatedUser.cancelledEffectiveDate = null;
        updatedUser.cancellationReason = null;
        message = `Abo von ${selectedUser.name} wurde reaktiviert`;
        break;
    }

    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setShowSubscriptionModal(false);
    setSelectedUser(null);
    setCancellationReason('');
    showSuccess(message);
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Starter':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Pro':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Builder':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Zähle gekündigte Abos
  const cancelledCount = users.filter(u => u.subscriptionStatus === 'cancelled').length;
  const activeCount = users.filter(u => u.subscriptionStatus === 'active').length;

  return (
    <div>
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-pulse">
          <i className="ri-check-line text-xl"></i>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Bar and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <i className="ri-search-line text-slate-400"></i>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Benutzer suchen (E-Mail oder Name)..."
            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Alle ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Aktiv ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'cancelled'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            Gekündigt ({cancelledCount})
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-400">Gratis-Konto</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-slate-400">Blockiert</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-slate-400">Gekündigt (läuft aus)</span>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Benutzer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Paket
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Abo-Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Kündigung
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Zahlungsmethode
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Ausgaben
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-slate-700/30 transition-colors cursor-pointer ${user.isBlocked ? 'opacity-60' : ''}`}
                  onClick={() => handleViewDetails(user)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        user.isBlocked ? 'bg-red-500/20' : 
                        user.subscriptionStatus === 'cancelled' ? 'bg-orange-500/20' : 
                        'bg-slate-700'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPlanColor(user.plan)}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSubscriptionStatusColor(user.subscriptionStatus)}`}>
                      {getSubscriptionStatusText(user.subscriptionStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.subscriptionStatus === 'cancelled' && user.cancelledAt ? (
                      <div className="text-xs">
                        <div className="flex items-center gap-1 text-orange-400 mb-1">
                          <i className="ri-calendar-close-line"></i>
                          <span>Gekündigt: {new Date(user.cancelledAt).toLocaleDateString('de-CH')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-400">
                          <i className="ri-timer-line"></i>
                          <span>Endet: {user.cancelledEffectiveDate ? new Date(user.cancelledEffectiveDate).toLocaleDateString('de-CH') : '-'}</span>
                        </div>
                        {user.cancelledEffectiveDate && (
                          <div className="mt-1 text-slate-500">
                            ({getDaysUntilEnd(user.cancelledEffectiveDate)} Tage verbleibend)
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <i className={`${getCardIcon(user.paymentMethod.type)} text-xl ${getCardColor(user.paymentMethod.type)}`}></i>
                      <span className="text-sm text-white">
                        •••• {user.paymentMethod.last4}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white font-medium">
                      CHF {user.totalSpent.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === user.id ? null : user.id);
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-more-2-fill text-slate-400 text-xl"></i>
                      </button>
                      
                      {activeDropdown === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(user);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-white hover:bg-slate-700/50 flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <i className="ri-eye-line"></i>
                            Details anzeigen
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageSubscription(user);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-amber-400 hover:bg-slate-700/50 flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <i className="ri-settings-3-line"></i>
                            Abo verwalten
                          </button>
                          
                          <div className="border-t border-slate-700"></div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockUser(user);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm hover:bg-slate-700/50 flex items-center gap-3 transition-colors cursor-pointer ${
                              user.isBlocked ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            <i className={user.isBlocked ? 'ri-lock-unlock-line' : 'ri-forbid-line'}></i>
                            {user.isBlocked ? 'Entsperren' : 'Blockieren'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl my-8">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-white text-2xl font-medium">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white">{selectedUser.name}</h3>
                    <p className="text-slate-400">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserDetailModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-slate-400 text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Kündigungs-Info Banner */}
              {selectedUser.subscriptionStatus === 'cancelled' && selectedUser.cancelledAt && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <i className="ri-error-warning-line text-orange-400 text-xl mt-0.5"></i>
                    <div className="flex-1">
                      <p className="text-orange-400 font-medium mb-2">Abo gekündigt</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Kündigungsdatum</p>
                          <p className="text-white font-medium">{new Date(selectedUser.cancelledAt).toLocaleDateString('de-CH')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Gültig bis (Ende Monat)</p>
                          <p className="text-white font-medium">
                            {selectedUser.cancelledEffectiveDate 
                              ? new Date(selectedUser.cancelledEffectiveDate).toLocaleDateString('de-CH')
                              : '-'}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400">Kündigungsgrund</p>
                          <p className="text-white">{selectedUser.cancellationReason || 'Kein Grund angegeben'}</p>
                        </div>
                        {selectedUser.cancelledEffectiveDate && (
                          <div className="col-span-2">
                            <p className="text-slate-400">Verbleibende Zeit</p>
                            <p className="text-orange-400 font-medium">
                              {getDaysUntilEnd(selectedUser.cancelledEffectiveDate)} Tage bis zur Deaktivierung
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Abo-Informationen */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Abo-Informationen</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Aktuelles Paket</p>
                    <p className="text-xl font-bold text-white">{selectedUser.plan}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSubscriptionStatusColor(selectedUser.subscriptionStatus)}`}>
                      {getSubscriptionStatusText(selectedUser.subscriptionStatus)}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Beigetreten</p>
                    <p className="text-lg font-medium text-white">
                      {new Date(selectedUser.joinDate).toLocaleDateString('de-CH')}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">Gesamtausgaben</p>
                    <p className="text-xl font-bold text-emerald-400">CHF {selectedUser.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Zahlungsmethode */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Zahlungsmethode</h4>
                <div className="p-4 bg-slate-900/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center`}>
                      <i className={`${getCardIcon(selectedUser.paymentMethod.type)} text-2xl ${getCardColor(selectedUser.paymentMethod.type)}`}></i>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {selectedUser.paymentMethod.type.toUpperCase()} •••• {selectedUser.paymentMethod.last4}
                      </p>
                      <p className="text-sm text-slate-400">
                        Gültig bis {selectedUser.paymentMethod.expiryMonth}/{selectedUser.paymentMethod.expiryYear}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg">
                    <i className="ri-shield-check-line text-emerald-400"></i>
                    <span className="text-xs text-slate-400">Stripe</span>
                  </div>
                </div>
              </div>

              {/* Rechnungsadresse */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Rechnungsadresse</h4>
                <div className="p-4 bg-slate-900/50 rounded-xl">
                  <p className="text-white font-medium mb-2">{selectedUser.billingAddress.name}</p>
                  <p className="text-slate-400 text-sm">{selectedUser.billingAddress.street}</p>
                  <p className="text-slate-400 text-sm">
                    {selectedUser.billingAddress.postalCode} {selectedUser.billingAddress.city}
                  </p>
                  <p className="text-slate-400 text-sm">{selectedUser.billingAddress.country}</p>
                </div>
              </div>

              {/* Transaktionshistorie */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Transaktionshistorie</h4>
                <div className="space-y-2">
                  {selectedUser.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 bg-slate-900/50 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                          <span>{new Date(transaction.date).toLocaleDateString('de-CH')}</span>
                          <span>•</span>
                          <span className="text-xs">{transaction.stripeId}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-400">
                          CHF {transaction.amount.toFixed(2)}
                        </p>
                        <span className="text-xs text-slate-400">{transaction.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700">
              <button
                onClick={() => setShowUserDetailModal(false)}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Management Modal */}
      {showSubscriptionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Abo verwalten</h3>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-slate-400 text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-slate-400">{selectedUser.plan} Paket</p>
                </div>
              </div>

              {/* Wenn bereits gekündigt, zeige Reaktivieren */}
              {selectedUser.subscriptionStatus === 'cancelled' && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <i className="ri-information-line text-orange-400 text-xl"></i>
                    <div className="text-sm">
                      <p className="text-orange-400 font-medium mb-1">Abo bereits gekündigt</p>
                      <p className="text-slate-300">
                        Gekündigt am: {selectedUser.cancelledAt ? new Date(selectedUser.cancelledAt).toLocaleDateString('de-CH') : '-'}
                      </p>
                      <p className="text-slate-300">
                        Gültig bis: {selectedUser.cancelledEffectiveDate ? new Date(selectedUser.cancelledEffectiveDate).toLocaleDateString('de-CH') : '-'}
                      </p>
                      <p className="text-slate-300">
                        Grund: {selectedUser.cancellationReason || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Aktion auswählen
                </label>
                <div className="space-y-2">
                  {selectedUser.subscriptionStatus === 'cancelled' ? (
                    <button
                      onClick={() => setSubscriptionAction('reactivate')}
                      className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        subscriptionAction === 'reactivate'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <i className={`ri-refresh-line text-xl ${subscriptionAction === 'reactivate' ? 'text-emerald-400' : 'text-slate-400'}`}></i>
                        <div>
                          <p className={`font-medium ${subscriptionAction === 'reactivate' ? 'text-emerald-400' : 'text-white'}`}>
                            Abo reaktivieren
                          </p>
                          <p className="text-xs text-slate-400">Kündigung rückgängig machen</p>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setSubscriptionAction('cancel')}
                        className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                          subscriptionAction === 'cancel'
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <i className={`ri-close-circle-line text-xl ${subscriptionAction === 'cancel' ? 'text-red-400' : 'text-slate-400'}`}></i>
                          <div>
                            <p className={`font-medium ${subscriptionAction === 'cancel' ? 'text-red-400' : 'text-white'}`}>
                              Abo kündigen
                            </p>
                            <p className="text-xs text-slate-400">Kündigung zum Monatsende</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSubscriptionAction('pause')}
                        className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                          subscriptionAction === 'pause'
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <i className={`ri-pause-circle-line text-xl ${subscriptionAction === 'pause' ? 'text-amber-400' : 'text-slate-400'}`}></i>
                          <div>
                            <p className={`font-medium ${subscriptionAction === 'pause' ? 'text-amber-400' : 'text-white'}`}>
                              Abo pausieren
                            </p>
                            <p className="text-xs text-slate-400">Temporäre Pause</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setSubscriptionAction('change')}
                        className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                          subscriptionAction === 'change'
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <i className={`ri-refresh-line text-xl ${subscriptionAction === 'change' ? 'text-emerald-400' : 'text-slate-400'}`}></i>
                          <div>
                            <p className={`font-medium ${subscriptionAction === 'change' ? 'text-emerald-400' : 'text-white'}`}>
                              Paket ändern
                            </p>
                            <p className="text-xs text-slate-400">Zu anderem Paket wechseln</p>
                          </div>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Kündigungsgrund eingeben */}
              {subscriptionAction === 'cancel' && selectedUser.subscriptionStatus !== 'cancelled' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Kündigungsgrund (optional)
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Warum wird das Abo gekündigt?"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-400">
                      <i className="ri-information-line mr-1"></i>
                      Das Abo wird zum <strong className="text-white">{new Date(getEndOfMonth()).toLocaleDateString('de-CH')}</strong> (Monatsende) beendet. 
                      Bis dahin hat der Benutzer vollen Zugang. Keine Rückerstattung.
                    </p>
                  </div>
                </div>
              )}

              {subscriptionAction === 'change' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Neues Paket
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Starter', 'Pro', 'Builder'].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setNewPlan(plan)}
                        disabled={plan === selectedUser.plan}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          plan === selectedUser.plan
                            ? 'border-slate-700 opacity-50 cursor-not-allowed'
                            : newPlan === plan
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <p className={`text-sm font-medium ${newPlan === plan && plan !== selectedUser.plan ? 'text-emerald-400' : 'text-white'}`}>
                          {plan}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmSubscriptionAction}
                className={`flex-1 py-3 text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  subscriptionAction === 'cancel'
                    ? 'bg-red-500 hover:bg-red-600'
                    : subscriptionAction === 'pause'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                Bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Total Users */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>Gesamt: {filteredUsers.length} Benutzer</span>
        <div className="flex gap-4">
          <span>{users.filter(u => u.isBlocked).length} blockiert</span>
          <span>{users.filter(u => u.isFree).length} gratis</span>
          <span className="text-orange-400">{cancelledCount} gekündigt</span>
        </div>
      </div>

      {/* Downgrade Modal */}
      {showDowngradeModal && selectedUser && (
        <DowngradeModal
          user={selectedUser}
          onClose={() => {
            setShowDowngradeModal(false);
            setSelectedUser(null);
          }}
          onSuccess={(updatedUser) => {
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
            setShowDowngradeModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Free Account Modal */}
      {showFreeModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Gratis-Konto gewähren</h3>
                <button
                  onClick={() => setShowFreeModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-slate-400 text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <i className="ri-user-line text-emerald-400 text-xl"></i>
                </div>
                <div>
                  <p className="text-white font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Paket auswählen
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Starter', 'Pro', 'Builder'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setFreePlan(plan)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        freePlan === plan
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <p className={`text-sm font-medium ${freePlan === plan ? 'text-emerald-400' : 'text-white'}`}>
                        {plan}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {plan === 'Starter' ? '2.5K' : plan === 'Pro' ? '10K' : '50K'} Credits
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Dauer (Monate)
                </label>
                <div className="flex gap-2">
                  {[1, 3, 6, 12].map((months) => (
                    <button
                      key={months}
                      onClick={() => setFreeMonths(months)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                        freeMonths === months
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {months}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <i className="ri-gift-line"></i>
                  <span className="font-medium">Zusammenfassung</span>
                </div>
                <p className="text-sm text-slate-300">
                  {selectedUser.name} erhält <strong className="text-white">{freeMonths} Monat(e)</strong> kostenloses <strong className="text-white">{freePlan}</strong>-Paket mit <strong className="text-white">{freePlan === 'Builder' ? '50.000' : freePlan === 'Pro' ? '10.000' : '2.500'}</strong> Credits.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowFreeModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmFreeAccount}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-gift-line"></i>
                Gratis gewähren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {selectedUser.isBlocked ? 'Benutzer entsperren' : 'Benutzer blockieren'}
                </h3>
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-slate-400 text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  selectedUser.isBlocked ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}>
                  <i className={`text-xl ${
                    selectedUser.isBlocked ? 'ri-lock-unlock-line text-emerald-400' : 'ri-forbid-line text-red-400'
                  }`}></i>
                </div>
                <div>
                  <p className="text-white font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              {/* Warning/Info */}
              {selectedUser.isBlocked ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <i className="ri-information-line text-emerald-400 text-xl mt-0.5"></i>
                    <div>
                      <p className="text-emerald-400 font-medium mb-1">Entsperren bestätigen</p>
                      <p className="text-sm text-slate-300">
                        Der Benutzer kann sich wieder anmelden und alle Funktionen nutzen.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <i className="ri-error-warning-line text-red-400 text-xl mt-0.5"></i>
                    <div>
                      <p className="text-red-400 font-medium mb-1">Warnung</p>
                      <p className="text-sm text-slate-300">
                        Der Benutzer wird sofort ausgeloggt und kann sich nicht mehr anmelden. Alle laufenden Sitzungen werden beendet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Effects List */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">
                  {selectedUser.isBlocked ? 'Nach dem Entsperren:' : 'Nach dem Blockieren:'}
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  {selectedUser.isBlocked ? (
                    <>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-emerald-400"></i>
                        Zugang zum Konto wiederhergestellt
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-emerald-400"></i>
                        Alle Funktionen wieder verfügbar
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-emerald-400"></i>
                        Credits und Verlauf bleiben erhalten
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <i className="ri-close-line text-red-400"></i>
                        Kein Zugang zum Konto
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-close-line text-red-400"></i>
                        Keine neuen Analysen möglich
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-emerald-400"></i>
                        Credits und Verlauf bleiben gespeichert
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmBlockUser}
                className={`flex-1 py-3 text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                  selectedUser.isBlocked
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                <i className={selectedUser.isBlocked ? 'ri-lock-unlock-line' : 'ri-forbid-line'}></i>
                {selectedUser.isBlocked ? 'Entsperren' : 'Blockieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
