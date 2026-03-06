import { useSubscription } from '../../../hooks/useSubscription';
import { useTranslation } from 'react-i18next';

const Overview = () => {
  const { t } = useTranslation();
  const { subscription } = useSubscription();

  const stats = [
    {
      icon: 'ri-lightbulb-flash-line',
      label: t('overview.analysesToday', 'Analyses today'),
      value: '12',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400'
    },
    {
      icon: 'ri-time-line',
      label: t('overview.avgResponseTime', 'Avg. response time'),
      value: '2.3s',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400'
    },
    {
      icon: 'ri-star-line',
      label: t('overview.successRate', 'Success rate'),
      value: '94%',
      color: 'from-[#C9A961] to-[#A08748]',
      bgColor: 'bg-[#C9A961]/10',
      textColor: 'text-[#C9A961]'
    },
    {
      icon: 'ri-trophy-line',
      label: t('overview.topRatings', 'Top ratings'),
      value: '8',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-500/10',
      textColor: 'text-rose-400'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'analysis',
      title: t('overview.activity.analysisComplete', 'Niche analysis completed'),
      description: t('overview.activity.analysisDesc', 'E-commerce for sustainable fashion'),
      time: t('overview.activity.hours2', '2 hours ago'),
      icon: 'ri-check-double-line',
      color: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      id: 2,
      type: 'credit',
      title: t('overview.activity.creditsUsed', 'Credits used'),
      description: t('overview.activity.creditsDesc', '50 credits for detailed analysis'),
      time: t('overview.activity.hours3', '3 hours ago'),
      icon: 'ri-coin-line',
      color: 'text-amber-400 bg-amber-400/10'
    },
    {
      id: 3,
      type: 'idea',
      title: t('overview.activity.ideaSaved', 'New idea saved'),
      description: t('overview.activity.ideaDesc', 'AI-powered fitness app'),
      time: t('overview.activity.hours5', '5 hours ago'),
      icon: 'ri-lightbulb-line',
      color: 'text-blue-400 bg-blue-400/10'
    },
    {
      id: 4,
      type: 'export',
      title: t('overview.activity.reportExported', 'Report exported'),
      description: t('overview.activity.reportDesc', 'PDF export successful'),
      time: t('overview.activity.day1', '1 day ago'),
      icon: 'ri-file-download-line',
      color: 'text-purple-400 bg-purple-400/10'
    }
  ];

  const quickLinks = [
    {
      title: t('overview.quick.newAnalysis', 'Start new analysis'),
      description: t('overview.quick.newAnalysisDesc', 'Start a new AI-powered niche analysis'),
      icon: 'ri-add-circle-line',
      color: 'from-emerald-500 to-teal-500',
      action: 'start-analysis'
    },
    {
      title: t('overview.quick.myAnalyses', 'My analyses'),
      description: t('overview.quick.myAnalysesDesc', 'View all previous analyses'),
      icon: 'ri-history-line',
      color: 'from-[#C9A961] to-[#A08748]',
      action: 'view-history'
    },
    {
      title: t('overview.quick.buyCredits', 'Buy credits'),
      description: t('overview.quick.buyCreditsDesc', 'More credits for more analyses'),
      icon: 'ri-coins-line',
      color: 'from-amber-500 to-orange-500',
      action: 'buy-credits'
    },
    {
      title: t('overview.quick.settings', 'Settings'),
      description: t('overview.quick.settingsDesc', 'Customize profile and preferences'),
      icon: 'ri-settings-3-line',
      color: 'from-blue-500 to-indigo-500',
      action: 'open-settings'
    }
  ];

  return (
    <div className="mt-4 sm:mt-8 space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Stats Overview */}
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">{t('overview.title', 'Overview')}</h2>
          <span className="text-xs sm:text-sm text-gray-400">{t('overview.last24h', 'Last 24 hours')}</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#242424] border border-gray-800 rounded-lg p-3 sm:p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${stat.icon} text-lg sm:text-xl ${stat.textColor}`}></i>
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white">{t('overview.recentActivity', 'Recent activity')}</h3>
            <button className="text-xs sm:text-sm text-[#C9A961] hover:text-[#D4B872] transition-colors cursor-pointer whitespace-nowrap">
              {t('overview.viewAll', 'View all')}
            </button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2.5 sm:p-3 bg-[#242424] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${activity.icon} text-base sm:text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white truncate">{activity.title}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{activity.description}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-white mb-4">{t('overview.quickAccess', 'Quick access')}</h3>

          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#242424] border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-[#2A2A2A] transition-all cursor-pointer group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <i className={`${link.icon} text-lg sm:text-xl text-white`}></i>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white group-hover:text-[#C9A961] transition-colors truncate">
                    {link.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{link.description}</p>
                </div>
                <i className="ri-arrow-right-line text-gray-600 group-hover:text-[#C9A961] transition-colors"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-gray-800 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-[#C9A961] to-[#A08748] flex items-center justify-center flex-shrink-0">
              <i className="ri-vip-crown-line text-2xl sm:text-3xl text-white"></i>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">{subscription.plan} Plan</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {subscription.credits === -1
                  ? t('overview.unlimitedCredits', 'Unlimited credits available')
                  : t('overview.creditsAvailable', '{{count}} credits available', { count: subscription.credits.toLocaleString() })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-[#C9A961] hover:bg-[#D4B872] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              {t('overview.upgradePlan', 'Upgrade plan')}
            </button>
            <button className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-[#242424] hover:bg-[#2A2A2A] text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors cursor-pointer whitespace-nowrap">
              {t('overview.buyCredits', 'Buy credits')}
            </button>
          </div>
        </div>

        {/* Progress Bar for Credits */}
        {subscription.credits !== -1 && (
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
              <span className="text-gray-400">{t('overview.creditUsage', 'Credit usage this month')}</span>
              <span className="text-white font-medium">
                {((subscription.credits / subscription.maxCredits) * 100).toFixed(0)}% {t('overview.available', 'available')}
              </span>
            </div>
            <div className="w-full h-2 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C9A961] to-[#D4B872] rounded-full transition-all duration-500"
                style={{ width: `${(subscription.credits / subscription.maxCredits) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;
