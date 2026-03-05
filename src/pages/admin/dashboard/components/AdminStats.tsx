import { useState, useEffect } from 'react';
import { adminRevenueStats, planPrices } from '../../../../mocks/dashboardData';

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
    totalUsers: 5,
    totalRevenue: 257,
    activeSubscriptions: 4,
    totalTransactions: 8,
    planDistribution: {
      starter: 1,
      pro: 2,
      builder: 2
    },
    revenueByPlan: {
      starter: 0,
      pro: 58,
      builder: 198
    },
    monthlyRevenue: adminRevenueStats.monthlyRevenue,
    churnRate: adminRevenueStats.churnRate,
    averageRevenuePerUser: adminRevenueStats.averageRevenuePerUser,
    revenueGrowth: adminRevenueStats.revenueGrowth,
    totalRefunds: 0,
    pendingRefunds: 0,
    refundCount: 0,
    netRevenue: adminRevenueStats.monthlyRevenue
  });

  const [couponStats, setCouponStats] = useState<CouponStats>({
    totalRegistrationCoupons: 0,
    totalTrialCoupons: 0,
    totalRedemptions: 0,
    registrationRedemptions: 0,
    trialRedemptions: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    topCoupons: []
  });

  useEffect(() => {
    // Lade Rückerstattungs-Statistiken aus localStorage
    const loadRefundStats = () => {
      try {
        const refundData = JSON.parse(localStorage.getItem('downgradeRefunds') || '[]');
        const pendingRefunds = JSON.parse(localStorage.getItem('pendingDowngradeRefunds') || '[]');
        
        const totalRefunds = refundData.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
        const pendingAmount = pendingRefunds.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalRefunds,
          pendingRefunds: pendingAmount,
          refundCount: refundData.length,
          netRevenue: prev.monthlyRevenue - totalRefunds
        }));
      } catch (error) {
        console.error('Fehler beim Laden der Rückerstattungs-Statistiken:', error);
      }
    };

    loadRefundStats();
    
    // Aktualisiere alle 2 Sekunden
    const interval = setInterval(loadRefundStats, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Lade Gutschein-Statistiken aus localStorage
    const loadCouponStats = () => {
      try {
        const regCoupons = JSON.parse(localStorage.getItem('admin_registration_coupons') || '[]');
        const trialCoupons = JSON.parse(localStorage.getItem('admin_trial_coupons') || '[]');

        const now = new Date();
        
        // Berechne Statistiken für Registrierungs-Gutscheine
        let regRedemptions = 0;
        let regActive = 0;
        let regExpired = 0;
        
        regCoupons.forEach((coupon: any) => {
          regRedemptions += coupon.usedCount || 0;
          if (coupon.isActive) {
            if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
              regExpired++;
            } else {
              regActive++;
            }
          } else {
            regExpired++;
          }
        });

        // Berechne Statistiken für Trial-Gutscheine
        let trialRedemptions = 0;
        let trialActive = 0;
        let trialExpired = 0;
        
        trialCoupons.forEach((coupon: any) => {
          trialRedemptions += coupon.usedCount || 0;
          if (coupon.isActive && coupon.expiresAt && new Date(coupon.expiresAt) >= now) {
            trialActive++;
          } else {
            trialExpired++;
          }
        });

        // Top Gutscheine nach Einlösungen
        const allCoupons = [
          ...regCoupons.map((c: any) => ({ code: c.code, usedCount: c.usedCount, type: 'Registrierung' })),
          ...trialCoupons.map((c: any) => ({ code: c.code, usedCount: c.usedCount, type: 'Test-Zugang' }))
        ];
        const topCoupons = allCoupons
          .filter((c: any) => c.usedCount > 0)
          .sort((a: any, b: any) => b.usedCount - a.usedCount)
          .slice(0, 5);

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

    loadCouponStats();
    
    // Aktualisiere alle 5 Sekunden
    const interval = setInterval(loadCouponStats, 5000);
    return () => clearInterval(interval);
  }, []);

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
          <p className="text-sm text-slate-400">Gesamte Benutzer</p>
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
          <p className="text-sm text-slate-400">Monatlicher Umsatz</p>
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
          <p className="text-sm text-slate-400">Aktive Abos</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-line-chart-line text-purple-400 text-xl"></i>
            </div>
            <span className="text-xs text-slate-400">Durchschnitt</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">CHF {stats.averageRevenuePerUser.toFixed(0)}</p>
          <p className="text-sm text-slate-400">Umsatz pro User</p>
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
          <p className="text-sm text-slate-400">Brutto-Umsatz</p>
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
                CHF {stats.pendingRefunds.toFixed(2)} ausstehend
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-red-400 mb-1">-CHF {stats.totalRefunds.toFixed(2)}</p>
          <p className="text-sm text-slate-400">Rückerstattungen ({stats.refundCount})</p>
        </div>

        {/* NEUE KARTE: Netto-Umsatz */}
        <div className="bg-slate-800/50 border border-[#C9A961]/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#C9A961]/10 rounded-lg flex items-center justify-center">
              <i className="ri-wallet-3-line text-[#C9A961] text-xl"></i>
            </div>
            <span className="text-xs text-[#C9A961] font-medium">NETTO</span>
          </div>
          <p className="text-3xl font-bold text-[#C9A961] mb-1">CHF {stats.netRevenue.toFixed(2)}</p>
          <p className="text-sm text-slate-400">Netto-Umsatz</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-down-circle-line text-red-400 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats.churnRate.toFixed(1)}%</p>
          <p className="text-sm text-slate-400">Kündigungsrate</p>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">Paket-Verteilung</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Starter</span>
                <span className="text-sm font-medium text-white">{stats.planDistribution.starter} Benutzer</span>
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
                <span className="text-sm font-medium text-white">{stats.planDistribution.pro} Benutzer</span>
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
                <span className="text-sm font-medium text-white">{stats.planDistribution.builder} Benutzer</span>
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
          <h3 className="text-lg font-bold text-white mb-6">Umsatz nach Paket</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <i className="ri-star-line text-blue-400"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Starter</p>
                  <p className="text-xs text-slate-400">{stats.planDistribution.starter} Benutzer</p>
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
                  <p className="text-xs text-slate-400">{stats.planDistribution.pro} Benutzer</p>
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
                  <p className="text-xs text-slate-400">{stats.planDistribution.builder} Benutzer</p>
                </div>
              </div>
              <p className="text-lg font-bold text-white">CHF {stats.revenueByPlan.builder}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Letzte Aktivitäten</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-up-line text-green-400"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Thomas Weber hat auf Builder upgegradet</p>
              <p className="text-xs text-slate-400">vor 2 Stunden</p>
            </div>
            <span className="text-sm font-medium text-green-400">+CHF 70</span>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-user-add-line text-blue-400"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Neuer Benutzer registriert</p>
              <p className="text-xs text-slate-400">vor 5 Stunden</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <i className="ri-arrow-up-line text-green-400"></i>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Anna Schmidt hat auf Pro upgegradet</p>
              <p className="text-xs text-slate-400">vor 1 Tag</p>
            </div>
            <span className="text-sm font-medium text-green-400">+CHF 29</span>
          </div>
        </div>
      </div>

      {/* Coupon Statistics Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <i className="ri-coupon-3-line text-amber-400"></i>
          Gutschein-Statistiken
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
            <p className="text-sm text-slate-400">Gesamte Einlösungen</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-green-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{couponStats.activeCoupons}</p>
            <p className="text-sm text-slate-400">Aktive Gutscheine</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-lg flex items-center justify-center">
                <i className="ri-vip-crown-line text-teal-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{couponStats.registrationRedemptions}</p>
            <p className="text-sm text-slate-400">Registrierungs-Einlösungen</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-orange-400 text-xl"></i>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{couponStats.trialRedemptions}</p>
            <p className="text-sm text-slate-400">Test-Zugangs-Einlösungen</p>
          </div>
        </div>

        {/* Coupon Distribution & Top Coupons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coupon Distribution */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-6">Gutschein-Verteilung</h4>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <i className="ri-vip-crown-line text-teal-400"></i>
                    Registrierungs-Gutscheine
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
                    Test-Zugangs-Gutscheine
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
                    Aktiv
                  </span>
                  <span className="text-sm font-medium text-green-400">{couponStats.activeCoupons}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300 flex items-center gap-2">
                    <i className="ri-close-circle-line text-red-400"></i>
                    Abgelaufen/Inaktiv
                  </span>
                  <span className="text-sm font-medium text-red-400">{couponStats.expiredCoupons}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Coupons */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h4 className="text-lg font-bold text-white mb-6">Top Gutscheine nach Einlösungen</h4>
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
                      <p className="text-xs text-slate-400">Einlösungen</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-coupon-3-line text-slate-500 text-2xl"></i>
                </div>
                <p className="text-slate-400">Noch keine Gutscheine eingelöst</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
