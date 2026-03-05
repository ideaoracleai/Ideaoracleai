import { useSubscription } from '../../../hooks/useSubscription';
import { useTranslation } from 'react-i18next';

const Overview = () => {
  const { t } = useTranslation();
  const { subscription } = useSubscription();

  const stats = [
    {
      icon: 'ri-lightbulb-flash-line',
      label: 'Analysen heute',
      value: '12',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400'
    },
    {
      icon: 'ri-time-line',
      label: 'Durchschn. Antwortzeit',
      value: '2.3s',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400'
    },
    {
      icon: 'ri-star-line',
      label: 'Erfolgsrate',
      value: '94%',
      color: 'from-[#C9A961] to-[#A08748]',
      bgColor: 'bg-[#C9A961]/10',
      textColor: 'text-[#C9A961]'
    },
    {
      icon: 'ri-trophy-line',
      label: 'Top-Bewertungen',
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
      title: 'Nischen-Analyse abgeschlossen',
      description: 'E-Commerce für nachhaltige Mode',
      time: 'vor 2 Stunden',
      icon: 'ri-check-double-line',
      color: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      id: 2,
      type: 'credit',
      title: 'Credits verwendet',
      description: '50 Credits für detaillierte Analyse',
      time: 'vor 3 Stunden',
      icon: 'ri-coin-line',
      color: 'text-amber-400 bg-amber-400/10'
    },
    {
      id: 3,
      type: 'idea',
      title: 'Neue Idee gespeichert',
      description: 'KI-gestützte Fitness-App',
      time: 'vor 5 Stunden',
      icon: 'ri-lightbulb-line',
      color: 'text-blue-400 bg-blue-400/10'
    },
    {
      id: 4,
      type: 'export',
      title: 'Bericht exportiert',
      description: 'PDF-Export erfolgreich',
      time: 'vor 1 Tag',
      icon: 'ri-file-download-line',
      color: 'text-purple-400 bg-purple-400/10'
    }
  ];

  const quickLinks = [
    {
      title: 'Neue Analyse starten',
      description: 'Starte eine neue KI-gestützte Nischen-Analyse',
      icon: 'ri-add-circle-line',
      color: 'from-emerald-500 to-teal-500',
      action: 'start-analysis'
    },
    {
      title: 'Meine Analysen',
      description: 'Alle bisherigen Analysen ansehen',
      icon: 'ri-history-line',
      color: 'from-[#C9A961] to-[#A08748]',
      action: 'view-history'
    },
    {
      title: 'Credits aufladen',
      description: 'Mehr Credits für weitere Analysen',
      icon: 'ri-coins-line',
      color: 'from-amber-500 to-orange-500',
      action: 'buy-credits'
    },
    {
      title: 'Einstellungen',
      description: 'Profil und Präferenzen anpassen',
      icon: 'ri-settings-3-line',
      color: 'from-blue-500 to-indigo-500',
      action: 'open-settings'
    }
  ];

  return (
    <div className="mt-8 space-y-6">
      {/* Stats Overview */}
      <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Übersicht</h2>
          <span className="text-sm text-gray-400">Letzte 24 Stunden</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#242424] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <i className={`${stat.icon} text-xl ${stat.textColor}`}></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Letzte Aktivitäten</h3>
            <button className="text-sm text-[#C9A961] hover:text-[#D4B872] transition-colors cursor-pointer whitespace-nowrap">
              Alle anzeigen
            </button>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-[#242424] border border-gray-800 rounded-lg hover:border-gray-700 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                  <i className={`${activity.icon} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{activity.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.description}</p>
                  <p className="text-xs text-gray-600 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Schnellzugriff</h3>

          <div className="grid grid-cols-1 gap-3">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                className="flex items-center gap-4 p-4 bg-[#242424] border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-[#2A2A2A] transition-all cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <i className={`${link.icon} text-xl text-white`}></i>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white group-hover:text-[#C9A961] transition-colors">
                    {link.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{link.description}</p>
                </div>
                <i className="ri-arrow-right-line text-gray-600 group-hover:text-[#C9A961] transition-colors"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Summary */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#C9A961] to-[#A08748] flex items-center justify-center">
              <i className="ri-vip-crown-line text-3xl text-white"></i>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{subscription.plan} Plan</h3>
              <p className="text-sm text-gray-400 mt-1">
                {subscription.credits === -1 
                  ? 'Unbegrenzte Credits verfügbar' 
                  : `${subscription.credits.toLocaleString('de-DE')} Credits verfügbar`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-2.5 bg-[#C9A961] hover:bg-[#D4B872] text-white font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              Plan upgraden
            </button>
            <button className="px-6 py-2.5 bg-[#242424] hover:bg-[#2A2A2A] text-white font-medium rounded-lg border border-gray-700 transition-colors cursor-pointer whitespace-nowrap">
              Credits kaufen
            </button>
          </div>
        </div>

        {/* Progress Bar for Credits */}
        {subscription.credits !== -1 && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Credit-Verbrauch diesen Monat</span>
              <span className="text-white font-medium">
                {((subscription.credits / subscription.maxCredits) * 100).toFixed(0)}% verfügbar
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
