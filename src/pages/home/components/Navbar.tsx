
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../../../components/feature/LanguageSelector';

interface NavLink {
  label: string;
  target: string;
}

interface NavbarData {
  logoText: string;
  logoAccent: string;
  slogan: string;
  logoIcon: string;
  links: NavLink[];
  ctaText: string;
  ctaUrl: string;
}

interface NavbarProps {
  isScrolled?: boolean;
}

export default function Navbar({ isScrolled = false }: NavbarProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customData, setCustomData] = useState<NavbarData | null>(null);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_navbar');
      if (saved) {
        try {
          setCustomData(JSON.parse(saved));
        } catch {
          setCustomData(null);
        }
      } else {
        setCustomData(null);
      }
    };

    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website_navbar') loadData();
    };
    const handleCustomEvent = () => loadData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  const logoText = customData?.logoText || 'IdeaOracle';
  const logoAccent = customData?.logoAccent || '.ai';
  const slogan = customData?.slogan || t('nav.slogan');
  const logoIcon = customData?.logoIcon || 'ri-compass-3-line';
  const ctaText = customData?.ctaText || t('nav.getStarted');
  const ctaUrl = customData?.ctaUrl || '/auth';

  const navLinks = customData?.links || [
    { label: t('nav.features'), target: 'features' },
    { label: t('nav.howItWorks'), target: 'how-it-works' },
    { label: t('nav.aboutUs'), target: 'about-us' },
    { label: t('nav.pricing'), target: 'pricing' },
    { label: t('nav.faq'), target: 'faq' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-[#0F1419]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <style>{`
        @keyframes starSparkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(251,191,36,0.8));
          }
          25% { 
            transform: scale(1.3) rotate(15deg); 
            opacity: 0.8;
            filter: drop-shadow(0 0 12px rgba(251,191,36,1));
          }
          50% { 
            transform: scale(0.9) rotate(-10deg); 
            opacity: 1;
            filter: drop-shadow(0 0 16px rgba(251,191,36,1));
          }
          75% { 
            transform: scale(1.2) rotate(5deg); 
            opacity: 0.9;
            filter: drop-shadow(0 0 10px rgba(251,191,36,0.9));
          }
        }
        .logo-group:hover .star-icon {
          animation: starSparkle 0.6s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 cursor-pointer group logo-group">
            <div className="relative w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A961]/20 group-hover:shadow-[#C9A961]/40 transition-all duration-300 group-hover:scale-105">
              <i className={`${logoIcon} text-[#0F1419] text-2xl`}></i>
              <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center">
                <i className="ri-star-s-fill text-amber-400 text-sm star-icon drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] transition-all duration-300"></i>
              </div>
            </div>
            <div>
              <span className="text-xl font-bold text-white">{logoText}<span className="text-amber-400">{logoAccent}</span></span>
              <p className="text-[10px] text-gray-400 -mt-0.5">{slogan}</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(link.target)}
                className="text-gray-600 hover:text-[#C9A961] transition-colors whitespace-nowrap cursor-pointer"
              >
                {link.label}
              </button>
            ))}
            <LanguageSelector />
            <a
              href={ctaUrl}
              className="px-6 py-2 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all whitespace-nowrap cursor-pointer font-semibold"
            >
              {ctaText}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <LanguageSelector />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-[#C9A961] cursor-pointer"
            >
              <i className={`${isMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSection(link.target)}
                  className="text-gray-600 hover:text-[#C9A961] transition-colors text-left cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <a
                href={ctaUrl}
                className="px-6 py-2 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all text-center whitespace-nowrap cursor-pointer font-semibold"
              >
                {ctaText}
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
