import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface QuickActionsProps {
  onViewChange: (view: 'overview' | 'chat' | 'history' | 'credits' | 'settings') => void;
}

export default function QuickActions({ onViewChange }: QuickActionsProps) {
  const { t } = useTranslation();
  const [userPlan, setUserPlan] = useState('Starter');

  useEffect(() => {
    const storedUser = localStorage.getItem('nichecheck_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserPlan(parsed.plan || 'Starter');
    }
  }, []);

  const isBuilder = userPlan === 'Builder';

  const actions = [
    {
      icon: 'ri-search-eye-line',
      title: t('dashboard.quickActions.checkNewIdea'),
      description: t('dashboard.quickActions.checkNewIdeaDesc'),
      color: 'from-[#C9A961] to-[#A08748]',
      onClick: () => onViewChange('chat'),
      disabled: false,
    },
    {
      icon: 'ri-lightbulb-flash-line',
      title: t('dashboard.quickActions.generateIdea'),
      description: t('dashboard.quickActions.generateIdeaDesc'),
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => onViewChange('chat'),
      disabled: false,
    },
    {
      icon: 'ri-file-code-line',
      title: t('dashboard.quickActions.builderBriefing'),
      description: t('dashboard.quickActions.builderBriefingDesc'),
      color: 'from-amber-500 to-amber-600',
      onClick: () => onViewChange('chat'),
      disabled: !isBuilder,
      badge: !isBuilder ? t('dashboard.quickActions.premiumOnly') : null,
    },
  ];

  return (
    <div className="mb-4 sm:mb-8 w-full">
      <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">{t('dashboard.quickActions.title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full auto-rows-fr">
        {actions.map((action, index) => (
          <div
            key={index}
            className="w-full"
          >
            <button
              onClick={action.onClick}
              disabled={action.disabled}
              className={`relative p-3 sm:p-5 bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl text-left transition-all group w-full h-full flex flex-col ${action.disabled
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:border-[#C9A961]/30 hover:shadow-lg cursor-pointer'
                }`}
              style={{ minHeight: '120px' }}
            >
              {action.badge && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-full whitespace-nowrap z-10">
                  {action.badge}
                </div>
              )}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 sm:mb-4 flex-shrink-0 ${!action.disabled && 'group-hover:scale-110'
                } transition-transform`}>
                <i className={`${action.icon} text-white text-lg sm:text-xl`}></i>
              </div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 pr-12 sm:pr-16">{action.title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{action.description}</p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
