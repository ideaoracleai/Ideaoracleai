
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSelector from "../../../components/feature/LanguageSelector";
import { useAuth, logout } from '../../../supabase';

interface HeaderProps {
  onNavigate?: (section: string) => void;
  onMobileMenuToggle?: () => void;
}

const Header = ({ onNavigate, onMobileMenuToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userDoc, firebaseUser } = useAuth();

  const userName = userDoc?.name || (firebaseUser as any)?.user_metadata?.name || firebaseUser?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="h-16 bg-[#1A1A1A] border-b border-gray-800 flex items-center justify-between px-3 lg:px-6 flex-shrink-0">
      {/* Left Side */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Hamburger — mobile only (< 768px) */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
          aria-label="Open menu"
        >
          <i className="ri-menu-line text-xl"></i>
        </button>

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 cursor-pointer group">
          <div className="relative w-9 h-9 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center shadow-lg shadow-[#C9A961]/20 group-hover:shadow-[#C9A961]/40 transition-all duration-300 flex-shrink-0">
            <i className="ri-compass-3-line text-[#0F1419] text-lg"></i>
            <div className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center">
              <i className="ri-star-s-fill text-amber-400 text-[10px] drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"></i>
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-white font-bold text-base leading-tight">IdeaOracle<span className="text-amber-400">.ai</span></h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">{t('dashboard.header.aiAssistant')}</p>
          </div>
        </a>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Notifications */}
        <button
          onClick={() => onNavigate?.("settings")}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
        >
          <i className="ri-notification-3-line text-xl"></i>
        </button>

        {/* Settings — hidden on very small screens */}
        <button
          onClick={() => onNavigate?.("settings")}
          className="hidden sm:flex w-9 h-9 items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5"
        >
          <i className="ri-settings-3-line text-xl"></i>
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => onNavigate?.("settings")}
          className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#C9A961] to-[#8B7355] flex items-center justify-center text-white font-medium cursor-pointer ring-2 ring-transparent hover:ring-[#C9A961]/40 transition-all flex-shrink-0"
        >
          {userDoc?.avatarUrl ? (
            <img src={userDoc.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">{userInitial}</span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
          title={t('header.logout')}
        >
          <i className="ri-logout-box-r-line text-xl"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
