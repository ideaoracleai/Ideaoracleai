import { useTranslation } from 'react-i18next';
import { stats } from '../../../mocks/dashboardData';
import { useSubscription } from '../../../hooks/useSubscription';

export default function StatsCards() {
  const { t } = useTranslation();

  // Zentraler Subscription Hook
  const { subscription } = useSubscription();

  const statCards = [
    {
      icon: 'ri-coin-line',
      label: t('dashboard.stats.creditsRemaining'),
      value: subscription.isUnlimited ? '∞' : subscription.credits.toLocaleString(),
      subtext: subscription.isUnlimited ? t('pricing.builder.credits') : `/ ${subscription.maxCredits.toLocaleString()}`,
      color: subscription.isUnlimited ? 'text-amber-400' : 'text-[#C9A961]',
      bgColor: subscription.isUnlimited ? 'bg-amber-500/10' : 'bg-[#C9A961]/10',
    },
    {
      icon: 'ri-file-list-3-line',
      label: t('dashboard.stats.totalAnalyses'),
      value: stats.totalAnalyses.toString(),
      subtext: t('dashboard.stats.totalAnalyses'),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: 'ri-thumb-up-line',
      label: t('dashboard.stats.goodRatings'),
      value: stats.goodRatings.toString(),
      subtext: `${Math.round((stats.goodRatings / stats.totalAnalyses) * 100)}%`,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: 'ri-calendar-line',
      label: t('dashboard.stats.nextReset'),
      value: '4',
      subtext: t('dashboard.stats.days'),
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-8">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl p-3 sm:p-5 hover:border-[#C9A961]/30 transition-all"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <i className={`${stat.icon} ${stat.color} text-base sm:text-xl`}></i>
            </div>
          </div>
          <p className="text-gray-500 text-[10px] sm:text-sm mb-1 truncate">{stat.label}</p>
          <div className="flex items-baseline gap-1 sm:gap-2">
            <span className={`text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            <span className="text-gray-500 text-[10px] sm:text-sm truncate">{stat.subtext}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
