import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminStats, adminGetAllCoupons } from '../../../../supabase/database';

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  totalTransactions: number;
  planDistribution: {
    starter: number;
    pro: number;
    builder: number;
  };
  revenueByPlan: {
    starter: number;
    pro: number;
    builder: number;
  };
  monthlyRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
  // Neue Rückerstattungs-Felder
  totalRefunds: number;
  pendingRefunds: number;
  refundCount: number;
  netRevenue: number;
}

interface CouponStats {
  totalRegistrationCoupons: number;
  totalTrialCoupons: number;
  totalRedemptions: number;
  registrationRedemptions: number;
  trialRedemptions: number;
  activeCoupons: number;
  expiredCoupons: number;
  topCoupons: { code: string; usedCount: number; type: string }[];
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalTransactions: 0,
    planDistribution: { starter: 0, pro: 0, builder: 0 },
    revenueByPlan: { starter: 0, pro: 0, builder: 0 },
    monthlyRevenue: 0,
    churnRate: 0,
    averageRevenuePerUser: 0,
    revenueGrowth: 0,
    totalRefunds: 0,
    pendingRefunds: 0,
    refundCount: 0,
    netRevenue: 0,
  });

  const [couponStats, setCouponStats] = useState<CouponStats>({
    totalRegistrationCoupons: 0,
    totalTrialCoupons: 0,
    totalRedemptions: 0,
    registrationRedemptions: 0,
    trialRedemptions: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    topCoupons: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const s = await getAdminStats();
        const dist = s.planDistribution;
        const proRevenue = (dist['Pro'] ?? 0) * 29;
        const builderRevenue = (dist['Builder'] ?? 0) * 99;
        const monthlyRev = proRevenue + builderRevenue;
        setStats({
          totalUsers: s.totalUsers,
          totalRevenue: s.totalRevenue,
          activeSubscriptions: s.activeSubscriptions,
          totalTransactions: s.totalUsers,
          planDistribution: {
            starter: dist['Starter'] ?? 0,
            pro: dist['Pro'] ?? 0,
            builder: dist['Builder'] ?? 0,
          },
          revenueByPlan: { starter: 0, pro: proRevenue, builder: builderRevenue },
          monthlyRevenue: monthlyRev,
          churnRate: s.totalUsers > 0 ? Math.round((s.cancelledUsers / s.totalUsers) * 100 * 10) / 10 : 0,
          averageRevenuePerUser: s.activeSubscriptions > 0 ? Math.round(monthlyRev / s.activeSubscriptions) : 0,
          revenueGrowth: 0,
          totalRefunds: 0,
          pendingRefunds: 0,
          refundCount: 0,
          netRevenue: monthlyRev,
        });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const loadCouponStats = async () => {
      try {
        const coupons = await adminGetAllCoupons();
        const now = new Date();
        const regCoupons = coupons.filter(c => c.category === 'registration');
        const trialCoupons = coupons.filter(c => c.category === 'trial');
        let regRedemptions = 0, regActive = 0, regExpired = 0;
        regCoupons.forEach(c => {
          regRedemptions += c.usedCount ?? 0;
          if (c.isActive && (!c.expiresAt || new Date(c.expiresAt) >= now)) regActive++;
          else regExpired++;
        });
        let trialRedemptions = 0, trialActive = 0, trialExpired = 0;
        trialCoupons.forEach(c => {
          trialRedemptions += c.usedCount ?? 0;
          if (c.isActive && c.expiresAt && new Date(c.expiresAt) >= now) trialActive++;
          else trialExpired++;
        });
        const topCoupons = coupons
          .filter(c => (c.usedCount ?? 0) > 0)
          .sort((a, b) => (b.usedCount ?? 0) - (a.usedCount ?? 0))
          .slice(0, 5)
          .map(c => ({ code: c.code, usedCount: c.usedCount ?? 0, type: c.category === 'registration' ? 'Registration' : 'Trial Access' }));
        setCouponStats({
          totalRegistrationCoupons: regCoupons.length,
          totalTrialCoupons: trialCoupons.length,
          totalRedemptions: regRedemptions + trialRedemptions,
          registrationRedemptions: regRedemptions,
          trialRedemptions: trialRedemptions,
          activeCoupons: regActive + trialActive,
          expiredCoupons: regExpired + trialExpired,
          topCoupons
        });
      } catch (error) {
        console.error('Fehler beim Laden der Gutschein-Statistiken:', error);
      }
    };

    loadStats();
    loadCouponStats();
  }, []);

  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-blue-400 text-xl"></i>
            </div>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <i className="ri-arrow-up-line"></i>
              +12%
            </span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</p>
          <p className="text-sm text-slate-400">{t('admin.stats.totalUsers', 'Total Users')}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-emerald-400 text-xl"></i>
            </div>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <i className="ri-arrow-up-line"></i>
              +{stats.revenueGrowth.toFixed(1)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">CHF {stats.monthlyRevenue}</p>
          <p className="text-sm text-slate-400">{t('admin.stats.monthlyRevenue', 'Monthly Revenue')}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-vip-crown-line text-amber-400 text-xl"></i>
            </div>
            <span className="text-xs text-green-400 flex items-center gap-1">
              <i className="ri-arrow-up-line"></i>
              +5%
            </span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.activeSubscriptions}</p>
          <p className="text-sm text-slate-400">{t('admin.stats.activeSubscriptions', 'Active Subscriptions')}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-line-chart-line text-purple-400 text-xl"></i>
            </div>
            <span className="text-xs text-slate-400">{t('admin.stats.average', 'Average')}</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">CHF {stats.averageRevenuePerUser.toFixed(0)}</p>
          <p className="text-sm text-slate-400">{t('admin.stats.revenuePerUser', 'Revenue per User')}</p>
        </div>
      </div>

      {/* Additional Revenue Stats - ERWEITERT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-funds-line text-emerald-400 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">CHF {stats.totalRevenue}</p>
          <p className="text-sm text-slate-400">{t('admin.stats.grossRevenue', 'Gross Revenue')}</p>
        </div>

        {/* NEUE KARTE: Rückerstattungen */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-refund-2-line text-red-400 text-xl"></i>
            </div>
            {stats.pendingRefunds > 0 && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <i className="ri-time-line"></i>
                CHF {stats.pendingRefunds.toFixed(2)} {t('admin.downgrade.pending', 'pending')}
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-red-400 mb-1">-CHF {stats.totalRefunds.toFixed(2)}</p>
          <p className="text-sm text-slate-400">{t('admin.downgrade.refunds', 'Refunds')} ({stats.refundCount})</p>
        </div>

        {/* NEUE KARTE: Netto-Umsatz */}
        <div className="bg-slate-800/50 border border-[#C9A961]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#C9A961]/10 rounded-lg flex items-center justify-center">
              <i className="ri-wallet-3-line text-[#C9A961] text-xl"></i>
            </div>
            <span className="text-xs text-[#C9A961] font-medium">{t('admin.stats.net', 'NET')}</span>
          </div>
          <p className="text-3xl font-bold text-[#C9A961] mb-1">CHF {stats.netRevenue.toFixed(2)}</p>
          <p className="text-sm text-slate-400">{t('admin.stats.netRevenue', 'Net Revenue')}</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-down-circle-line text-red-400 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.churnRate.toFixed(1)}%</p>
          <p className="text-sm text-slate-400">{t('admin.stats.churnRate', 'Churn Rate')}</p>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">{t('admin.stats.planDistribution', 'Plan Distribution')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Starter</span>
                <span className="text-sm font-medium text-white">{stats.planDistribution.starter} {t('admin.stats.users', 'users')}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(stats.planDistribution.starter / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Pro</span>
                <span className="text-sm font-medium text-white">{stats.planDistribution.pro} {t('admin.stats.users', 'users')}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${(stats.planDistribution.pro / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Builder</span>
                <span className="text-sm font-medium text-white">{stats.planDistribution.builder} {t('admin.stats.users', 'users')}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${(stats.planDistribution.builder / stats.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">{t('admin.stats.revenueByPlan', 'Revenue by Plan')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <i className="ri-star-line text-blue-400"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Starter</p>
                  <p className="text-xs text-slate-400">{stats.planDistribution.starter} {t('admin.stats.users', 'users')}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">CHF {stats.revenueByPlan.starter}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <i className="ri-vip-crown-line text-emerald-400"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Pro</p>
                  <p className="text-xs text-slate-400">{stats.planDistribution.pro} {t('admin.stats.users', 'users')}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">CHF {stats.revenueByPlan.pro}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <i className="ri-trophy-line text-amber-400"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Builder</p>
                  <p className="text-xs text-slate-400">{stats.planDistribution.builder} {t('admin.stats.users', 'users')}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">CHF {stats.revenueByPlan.builder}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">{t('admin.stats.recentActivity', 'Recent Activity')}</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-up-line text-green-400"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{t('admin.stats.activity1', 'Thomas Weber upgraded to Builder')}</p>
              <p className="text-xs text-slate-400">{t('admin.stats.hoursAgo2', '2 hours ago')}</p>
            </div>
            <span className="text-sm font-medium text-green-400">+CHF 70</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-user-add-line text-blue-400"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{t('admin.stats.activity2', 'New user registered')}</p>
              <p className="text-xs text-slate-400">{t('admin.stats.hoursAgo5', '5 hours ago')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-up-line text-green-400"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{t('admin.stats.activity3', 'Anna Schmidt upgraded to Pro')}</p>
              <p className="text-xs text-slate-400">{t('admin.stats.dayAgo1', '1 day ago')}</p>
            </div>
            <span className="text-sm font-medium text-green-400">+CHF 29</span>
          </div>
        </div>
      </div>

      {/* Coupon Statistics Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <i className="ri-coupon-3-line text-amber-400"></i>
          {t('admin.stats.couponStats', 'Coupon Statistics')}
        </h3>
        
        {/* Coupon Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <i className="ri-ticket-line text-amber-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{couponStats.totalRedemptions}</p>
            <p className="text-sm text-slate-400">{t('admin.stats.totalRedemptions', 'Total Redemptions')}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-green-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{couponStats.activeCoupons}</p>
            <p className="text-sm text-slate-400">{t('admin.stats.activeCoupons', 'Active Coupons')}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
                <i className="ri-vip-crown-line text-teal-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{couponStats.registrationRedemptions}</p>
            <p className="text-sm text-slate-400">{t('admin.stats.registrationRedemptions', 'Registration Redemptions')}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-orange-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{couponStats.trialRedemptions}</p>
            <p className="text-sm text-slate-400">{t('admin.stats.trialRedemptions', 'Trial Redemptions')}</p>
          </div>
        </div>

        {/* Coupon Distribution & Top Coupons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coupon Distribution */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-6">{t('admin.stats.couponDistribution', 'Coupon Distribution')}</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <i className="ri-vip-crown-line text-teal-400"></i>
                    {t('admin.stats.registrationCoupons', 'Registration Coupons')}
                  </span>
                  <span className="text-sm font-medium text-white">{couponStats.totalRegistrationCoupons}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${couponStats.totalRegistrationCoupons + couponStats.totalTrialCoupons > 0 ? (couponStats.totalRegistrationCoupons / (couponStats.totalRegistrationCoupons + couponStats.totalTrialCoupons)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <i className="ri-time-line text-orange-400"></i>
                    {t('admin.stats.trialCoupons', 'Trial Coupons')}
                  </span>
                  <span className="text-sm font-medium text-white">{couponStats.totalTrialCoupons}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${couponStats.totalRegistrationCoupons + couponStats.totalTrialCoupons > 0 ? (couponStats.totalTrialCoupons / (couponStats.totalRegistrationCoupons + couponStats.totalTrialCoupons)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <i className="ri-checkbox-circle-line text-green-400"></i>
                    {t('admin.status.active', 'Active')}
                  </span>
                  <span className="text-sm font-medium text-green-400">{couponStats.activeCoupons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <i className="ri-close-circle-line text-red-400"></i>
                    {t('admin.stats.expiredInactive', 'Expired/Inactive')}
                  </span>
                  <span className="text-sm font-medium text-red-400">{couponStats.expiredCoupons}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Coupons */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-6">{t('admin.stats.topCoupons', 'Top Coupons by Redemptions')}</h4>
            {couponStats.topCoupons.length > 0 ? (
              <div className="space-y-3">
                {couponStats.topCoupons.map((coupon, index) => (
                  <div key={coupon.code} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-amber-500/20 text-amber-400' :
                        index === 1 ? 'bg-slate-400/20 text-slate-300' :
                        index === 2 ? 'bg-orange-600/20 text-orange-400' :
                        'bg-slate-700/50 text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <code className="text-sm font-mono text-white">{coupon.code}</code>
                        <p className="text-xs text-slate-400">{coupon.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{coupon.usedCount}</p>
                      <p className="text-xs text-slate-400">{t('admin.stats.redemptions', 'redemptions')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-coupon-3-line text-slate-500 text-2xl"></i>
                </div>
                <p className="text-slate-400">{t('admin.stats.noCouponsRedeemed', 'No coupons redeemed yet')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
