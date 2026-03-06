import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../../../hooks/useSubscription';
import { useAuth } from '../../../supabase';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: 'dashboard' | 'chat' | 'history' | 'credits' | 'settings' | 'subscription') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  activeView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { t } = useTranslation();
  const { subscription } = useSubscription();
  const { userDoc, firebaseUser } = useAuth();

  const userName = userDoc?.name || (firebaseUser as any)?.user_metadata?.name || firebaseUser?.email?.split('@')[0] || 'User';
  const userEmail = userDoc?.email || firebaseUser?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const planName = userDoc?.plan || subscription.plan;

  const menuItems = [
    { id: 'dashboard', icon: 'ri-dashboard-line', label: t('dashboard.sidebar.overview') },
    { id: 'chat', icon: 'ri-chat-smile-ai-line', label: t('dashboard.sidebar.aiChat', 'AI Assistant') },
    { id: 'history', icon: 'ri-history-line', label: t('dashboard.sidebar.history') },
    { id: 'credits', icon: 'ri-coin-line', label: t('dashboard.sidebar.credits') },
    { id: 'subscription', icon: 'ri-bank-card-line', label: t('settings.subscriptionLink') },
    { id: 'settings', icon: 'ri-settings-3-line', label: t('dashboard.sidebar.settings') }
  ];

  const handleNavClick = (id: string) => {
    onViewChange(id as any);
    onMobileClose();
  };

  return (
    <>
      {/* ── Desktop Sidebar ── always visible on md+ screens, collapsible ── */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0
          bg-[#1A1F26] border-r border-[#3D3428]/30
          h-screen sticky top-0
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-[72px]' : 'w-60'}
        `}
      >
        {/* Logo / Brand */}
        <div className={`p-3 border-b border-[#3D3428]/30 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-lightbulb-flash-line text-[#0F1419] text-base"></i>
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">IdeaValidator</p>
                <p className="text-gray-400 text-[11px] truncate">{planName} Plan</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5 flex-shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <i className={`ri-${isCollapsed ? 'menu-unfold' : 'menu-fold'}-line text-lg`}></i>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all cursor-pointer
                    ${isCollapsed ? 'justify-center' : ''}
                    ${activeView === item.id
                      ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <i className={`${item.icon} text-lg flex-shrink-0`}></i>
                  {!isCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-2 border-t border-[#3D3428]/30">
          <div className={`flex items-center gap-2 p-1 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#C9A961] to-[#A08748] flex items-center justify-center flex-shrink-0">
              {userDoc?.avatarUrl ? (
                <img src={userDoc.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#0F1419] font-bold text-xs">{userInitial}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-xs truncate">{userName}</p>
                <p className="text-gray-400 text-[11px] truncate">{userEmail}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Overlay Drawer ── shown only on < md screens ── */}
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={onMobileClose}
          />
          {/* Drawer panel */}
          <div
            className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col md:hidden
                        bg-[#1A1F26] border-r border-[#3D3428]/30
                        animate-[slideInLeft_0.25s_ease]"
          >
            {/* Mobile Header */}
            <div className="p-4 border-b border-[#3D3428]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center">
                  <i className="ri-lightbulb-flash-line text-[#0F1419] text-base"></i>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">IdeaValidator</p>
                  <p className="text-gray-400 text-[11px]">{planName} Plan</p>
                </div>
              </div>
              <button onClick={onMobileClose} className="text-gray-400 hover:text-white p-1">
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Mobile Nav */}
            <nav className="flex-1 p-2 overflow-y-auto">
              <ul className="space-y-0.5">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${activeView === item.id
                        ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                    >
                      <i className={`${item.icon} text-lg`}></i>
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile User Profile */}
            <div className="p-3 border-t border-[#3D3428]/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#C9A961] to-[#A08748] flex items-center justify-center flex-shrink-0">
                  {userDoc?.avatarUrl ? (
                    <img src={userDoc.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#0F1419] font-bold text-xs">{userInitial}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-xs truncate">{userName}</p>
                  <p className="text-gray-400 text-[11px] truncate">{userEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
