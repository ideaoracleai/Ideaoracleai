import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DowngradeModal from './DowngradeModal';
import {
  getAllUsers,
  adminSetUserBlocked,
  adminCancelSubscription,
  adminReactivateSubscription,
  adminUpdateUserPlan,
  adminAddCredits,
  type AdminUser,
} from '../../../../supabase/database';

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
  const [isLoading, setIsLoading] = useState(true);

  const mapAdminUser = (u: AdminUser): User => ({
    id: u.uid,
    email: u.email,
    name: u.name || u.email.split('@')[0],
    plan: u.plan,
    credits: u.credits,
    joinDate: u.joinDate,
    lastActive: u.joinDate,
    totalSpent: u.totalSpent,
    isBlocked: u.isBlocked,
    subscriptionStatus: u.subscriptionStatus,
    cancelledAt: u.cancelledAt,
    cancelledEffectiveDate: u.cancelledEffectiveDate,
    cancellationReason: u.cancellationReason,
    paymentMethod: { type: 'visa' as const, last4: '****', expiryMonth: 12, expiryYear: 2025 },
    billingAddress: { name: u.name, street: '', city: '', postalCode: '', country: '' },
    transactions: [],
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.map(mapAdminUser));
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
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

  const confirmFreeAccount = async () => {
    if (!selectedUser) return;
    const bonusCredits = freePlan === 'Builder' ? 50000 : freePlan === 'Pro' ? 10000 : 2500;
    try {
      await adminUpdateUserPlan(selectedUser.id, freePlan, bonusCredits);
      await adminAddCredits(selectedUser.id, bonusCredits);
      await loadUsers();
      showSuccess(`${selectedUser.name} hat jetzt ${freeMonths} Monat(e) kostenloses ${freePlan}-Paket`);
    } catch (err) {
      console.error('Failed to grant free account:', err);
    }
    setShowFreeModal(false);
    setSelectedUser(null);
  };

  const confirmBlockUser = async () => {
    if (!selectedUser) return;
    const newBlocked = !selectedUser.isBlocked;
    try {
      await adminSetUserBlocked(selectedUser.id, newBlocked);
      await loadUsers();
      showSuccess(newBlocked ? `${selectedUser.name} wurde blockiert` : `${selectedUser.name} wurde entsperrt`);
    } catch (err) {
      console.error('Failed to block/unblock user:', err);
    }
    setShowBlockModal(false);
    setSelectedUser(null);
  };

  const removeFreeStatus = async (user: User) => {
    try {
      await adminUpdateUserPlan(user.id, 'Starter', 0);
      await loadUsers();
      showSuccess(`Gratis-Status von ${user.name} wurde entfernt`);
    } catch (err) {
      console.error('Failed to remove free status:', err);
    }
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

  const { t } = useTranslation();

  const getSubscriptionStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('admin.subscription.active', 'Active');
      case 'cancelled':
        return t('admin.subscription.cancelled', 'Cancelled');
      case 'overdue':
        return t('admin.subscription.paused', 'Paused');
      default:
        return t('admin.subscription.unknown', 'Unknown');
    }
  };

  const confirmSubscriptionAction = async () => {
    if (!selectedUser) return;
    let message = '';
    try {
      switch (subscriptionAction) {
        case 'cancel': {
          const endOfMonth = getEndOfMonth();
          await adminCancelSubscription(selectedUser.id, cancellationReason || t('admin.users.noReasonGiven', 'No reason given'), endOfMonth);
          message = t('admin.users.subCancelled', 'Subscription of {{name}} cancelled (valid until {{date}})', { name: selectedUser.name, date: new Date(endOfMonth).toLocaleDateString() });
          break;
        }
        case 'pause':
          await adminCancelSubscription(selectedUser.id, t('admin.users.paused', 'Paused'), getEndOfMonth());
          message = t('admin.users.subPaused', 'Subscription of {{name}} has been paused', { name: selectedUser.name });
          break;
        case 'change': {
          const planCreds: Record<string, number> = { Starter: 0, Pro: 5000, Builder: 999999 };
          await adminUpdateUserPlan(selectedUser.id, newPlan, planCreds[newPlan] ?? 0);
          message = t('admin.users.subChanged', 'Subscription of {{name}} changed to {{plan}}', { name: selectedUser.name, plan: newPlan });
          break;
        }
        case 'reactivate':
          await adminReactivateSubscription(selectedUser.id);
          message = t('admin.users.subReactivated', 'Subscription of {{name}} has been reactivated', { name: selectedUser.name });
          break;
      }
      await loadUsers();
      showSuccess(message);
    } catch (err) {
      console.error('Failed to update subscription:', err);
    }
    setShowSubscriptionModal(false);
    setSelectedUser(null);
    setCancellationReason('');
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
            placeholder={t('admin.users.searchPlaceholder', 'Search users (email or name)...')}
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
            {t('admin.filter.all', 'All')} ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {t('admin.subscription.active', 'Active')} ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              statusFilter === 'cancelled'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {t('admin.subscription.cancelled', 'Cancelled')} ({cancelledCount})
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span className="text-slate-400">{t('admin.users.freeAccount', 'Free Account')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-slate-400">{t('admin.users.blocked', 'Blocked')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-slate-400">{t('admin.users.cancelledExpiring', 'Cancelled (expiring)')}</span>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.table.user', 'User')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.table.plan', 'Plan')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.table.subStatus', 'Subscription Status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.table.cancellation', 'Cancellation')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.table.payment', 'Payment Method')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.table.spending', 'Spending')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {t('admin.table.actions', 'Actions')}
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
                          <span>{t('admin.users.cancelledOn', 'Cancelled:')} {new Date(user.cancelledAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-400">
                          <i className="ri-timer-line"></i>
                          <span>{t('admin.users.endsOn', 'Ends:')} {user.cancelledEffectiveDate ? new Date(user.cancelledEffectiveDate).toLocaleDateString() : '-'}</span>
                        </div>
                        {user.cancelledEffectiveDate && (
                          <div className="mt-1 text-slate-500">
                            ({getDaysUntilEnd(user.cancelledEffectiveDate)} {t('admin.users.daysRemaining', 'days remaining')})
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
                            {t('admin.actions.viewDetails', 'View details')}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageSubscription(user);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-amber-400 hover:bg-slate-700/50 flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <i className="ri-settings-3-line"></i>
                            {t('admin.users.manageSubscription', 'Manage subscription')}
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
                            {user.isBlocked ? t('admin.users.unblock', 'Unblock') : t('admin.users.block', 'Block')}
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
                      <p className="text-orange-400 font-medium mb-2">{t('admin.users.subCancelled', 'Subscription cancelled')}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">{t('admin.users.cancellationDate', 'Cancellation date')}</p>
                          <p className="text-white font-medium">{new Date(selectedUser.cancelledAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">{t('admin.users.validUntil', 'Valid until (end of month)')}</p>
                          <p className="text-white font-medium">
                            {selectedUser.cancelledEffectiveDate 
                              ? new Date(selectedUser.cancelledEffectiveDate).toLocaleDateString()
                              : '-'}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400">{t('admin.users.cancellationReason', 'Cancellation reason')}</p>
                          <p className="text-white">{selectedUser.cancellationReason || t('admin.users.noReason', 'No reason given')}</p>
                        </div>
                        {selectedUser.cancelledEffectiveDate && (
                          <div className="col-span-2">
                            <p className="text-slate-400">{t('admin.users.timeRemaining', 'Time remaining')}</p>
                            <p className="text-orange-400 font-medium">
                              {getDaysUntilEnd(selectedUser.cancelledEffectiveDate)} {t('admin.users.daysUntilDeactivation', 'days until deactivation')}
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
                <h4 className="text-lg font-semibold text-white mb-4">{t('admin.users.subInfo', 'Subscription Information')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">{t('admin.users.currentPlan', 'Current Plan')}</p>
                    <p className="text-xl font-bold text-white">{selectedUser.plan}</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">{t('admin.table.status', 'Status')}</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSubscriptionStatusColor(selectedUser.subscriptionStatus)}`}>
                      {getSubscriptionStatusText(selectedUser.subscriptionStatus)}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">{t('admin.users.joined', 'Joined')}</p>
                    <p className="text-lg font-medium text-white">
                      {new Date(selectedUser.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-xl">
                    <p className="text-sm text-slate-400 mb-1">{t('admin.users.totalSpent', 'Total Spent')}</p>
                    <p className="text-xl font-bold text-emerald-400">CHF {selectedUser.totalSpent.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Zahlungsmethode */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">{t('admin.users.paymentMethod', 'Payment Method')}</h4>
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
                        {t('admin.users.validThrough', 'Valid through')} {selectedUser.paymentMethod.expiryMonth}/{selectedUser.paymentMethod.expiryYear}
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
                <h4 className="text-lg font-semibold text-white mb-4">{t('admin.users.billingAddress', 'Billing Address')}</h4>
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
                <h4 className="text-lg font-semibold text-white mb-4">{t('admin.users.transactionHistory', 'Transaction History')}</h4>
                <div className="space-y-2">
                  {selectedUser.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 bg-slate-900/50 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                          <span>{new Date(transaction.date).toLocaleDateString()}</span>
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
                {t('admin.actions.close', 'Close')}
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
                <h3 className="text-xl font-semibold text-white">{t('admin.users.manageSubscription', 'Manage subscription')}</h3>
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
                  <p className="text-sm text-slate-400">{selectedUser.plan} {t('admin.users.planLabel', 'Plan')}</p>
                </div>
              </div>

              {/* Wenn bereits gekündigt, zeige Reaktivieren */}
              {selectedUser.subscriptionStatus === 'cancelled' && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <i className="ri-information-line text-orange-400 text-xl"></i>
                    <div className="text-sm">
                      <p className="text-orange-400 font-medium mb-1">{t('admin.users.alreadyCancelled', 'Subscription already cancelled')}</p>
                      <p className="text-slate-300">
                        {t('admin.users.cancelledOn', 'Cancelled:')} {selectedUser.cancelledAt ? new Date(selectedUser.cancelledAt).toLocaleDateString() : '-'}
                      </p>
                      <p className="text-slate-300">
                        {t('admin.users.validUntil', 'Valid until (end of month):')} {selectedUser.cancelledEffectiveDate ? new Date(selectedUser.cancelledEffectiveDate).toLocaleDateString() : '-'}
                      </p>
                      <p className="text-slate-300">
                        {t('admin.users.cancellationReason', 'Reason:')} {selectedUser.cancellationReason || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  {t('admin.users.selectAction', 'Select action')}
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
                            {t('admin.users.reactivateSub', 'Reactivate subscription')}
                          </p>
                          <p className="text-xs text-slate-400">{t('admin.users.reactivateDesc', 'Undo cancellation')}</p>
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
                              {t('admin.users.cancelSub', 'Cancel subscription')}
                            </p>
                            <p className="text-xs text-slate-400">{t('admin.users.cancelSubDesc', 'Cancellation at end of month')}</p>
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
                              {t('admin.users.pauseSub', 'Pause subscription')}
                            </p>
                            <p className="text-xs text-slate-400">{t('admin.users.pauseSubDesc', 'Temporary pause')}</p>
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
                              {t('admin.users.changePlan', 'Change plan')}
                            </p>
                            <p className="text-xs text-slate-400">{t('admin.users.changePlanDesc', 'Switch to another plan')}</p>
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
                    {t('admin.users.cancellationReasonOpt', 'Cancellation reason (optional)')}
                  </label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder={t('admin.users.cancellationPlaceholder', 'Why is the subscription being cancelled?')}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="mt-3 p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-xs text-slate-400">
                      <i className="ri-information-line mr-1"></i>
                      {t('admin.users.cancelInfo1', 'The subscription will end on')} <strong className="text-white">{new Date(getEndOfMonth()).toLocaleDateString()}</strong> {t('admin.users.cancelInfo2', '(end of month). Until then the user has full access. No refund.')}
                    </p>
                  </div>
                </div>
              )}

              {subscriptionAction === 'change' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    {t('admin.users.newPlan', 'New plan')}
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
                {t('admin.actions.cancel', 'Cancel')}
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
                {t('admin.actions.confirm', 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Total Users */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
        <span>{t('admin.users.total', 'Total:')} {filteredUsers.length} {t('admin.users.usersLabel', 'users')}</span>
        <div className="flex gap-4">
          <span>{users.filter(u => u.isBlocked).length} {t('admin.users.blocked', 'blocked')}</span>
          <span>{users.filter(u => u.isFree).length} {t('admin.users.free', 'free')}</span>
          <span className="text-orange-400">{cancelledCount} {t('admin.subscription.cancelled', 'cancelled')}</span>
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
          onSuccess={async () => {
            await loadUsers();
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
                <h3 className="text-xl font-semibold text-white">{t('admin.users.grantFree', 'Grant free account')}</h3>
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
                  {t('admin.users.selectPlan', 'Select plan')}
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
                  {t('admin.users.durationMonths', 'Duration (months)')}
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
                  <span className="font-medium">{t('admin.downgrade.summary', 'Summary')}</span>
                </div>
                <p className="text-sm text-slate-300">
                  {selectedUser.name} {t('admin.users.freeSummary', 'receives')} <strong className="text-white">{freeMonths} {t('admin.users.months', 'month(s)')}</strong> {t('admin.users.freePlan', 'free')} <strong className="text-white">{freePlan}</strong> {t('admin.users.planLabel', 'Plan')} {t('admin.users.withCredits', 'with')} <strong className="text-white">{freePlan === 'Builder' ? '50,000' : freePlan === 'Pro' ? '10,000' : '2,500'}</strong> {t('admin.users.credits', 'Credits')}.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowFreeModal(false)}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                {t('admin.actions.cancel', 'Cancel')}
              </button>
              <button
                onClick={confirmFreeAccount}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-gift-line"></i>
                {t('admin.users.grantFreeBtn', 'Grant free')}
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
                  {selectedUser.isBlocked ? t('admin.users.unblockUser', 'Unblock user') : t('admin.users.blockUser', 'Block user')}
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
                      <p className="text-emerald-400 font-medium mb-1">{t('admin.users.confirmUnblock', 'Confirm unblock')}</p>
                      <p className="text-sm text-slate-300">
                        {t('admin.users.unblockDesc', 'The user can log in again and use all features.')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <i className="ri-error-warning-line text-red-400 text-xl mt-0.5"></i>
                    <div>
                      <p className="text-red-400 font-medium mb-1">{t('admin.users.warning', 'Warning')}</p>
                      <p className="text-sm text-slate-300">
                        {t('admin.users.blockDesc', 'The user will be immediately logged out and cannot log in again. All active sessions will be terminated.')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Effects List */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-300">
                  {selectedUser.isBlocked ? t('admin.users.afterUnblock', 'After unblocking:') : t('admin.users.afterBlock', 'After blocking:')}
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  {selectedUser.isBlocked ? (
                    <>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-emerald-400"></i>
                        {t('admin.users.accessRestored', 'Account access restored')}
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-emerald-400"></i>
                        {t('admin.users.allFeaturesAvail', 'All features available again')}
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-emerald-400"></i>
                        {t('admin.users.creditsPreserved', 'Credits and history preserved')}
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2">
                        <i className="ri-close-line text-red-400"></i>
                        {t('admin.users.noAccountAccess', 'No account access')}
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-close-line text-red-400"></i>
                        {t('admin.users.noNewAnalyses', 'No new analyses possible')}
                      </li>
                      <li className="flex items-center gap-2">
                        <i className="ri-check-line text-emerald-400"></i>
                        {t('admin.users.creditsStored', 'Credits and history remain stored')}
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
                {t('admin.actions.cancel', 'Cancel')}
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
                {selectedUser.isBlocked ? t('admin.users.unblock', 'Unblock') : t('admin.users.block', 'Block')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
