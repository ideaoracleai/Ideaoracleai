import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../../hooks/useSubscription';
import { useAuth } from '../../../supabase';
import { getIdeaHistory } from '../../../supabase/database';

export default function StatsCards() {
  const { t } = useTranslation();
  const { firebaseUser } = useAuth();
  const { subscription } = useSubscription();
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [goodRatings, setGoodRatings] = useState(0);

  useEffect(() => {
    if (!firebaseUser?.id) return;
    getIdeaHistory(firebaseUser.id, 500).then(ideas => {
      setTotalAnalyses(ideas.length);
      setGoodRatings(ideas.filter(i => i.rating === 'good').length);
    }).catch(() => {});
  }, [firebaseUser?.id]);

  // Days until next monthly reset
  const now = new Date();
  const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const resetDays = Math.max(1, Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

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
      value: totalAnalyses.toString(),
      subtext: t('dashboard.stats.totalAnalyses'),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: 'ri-thumb-up-line',
      label: t('dashboard.stats.goodRatings'),
      value: goodRatings.toString(),
      subtext: totalAnalyses > 0 ? `${Math.round((goodRatings / totalAnalyses) * 100)}%` : '0%',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      icon: 'ri-calendar-line',
      label: t('dashboard.stats.nextReset'),
      value: resetDays.toString(),
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
