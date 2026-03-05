import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

interface FooterLink {
  label: string;
  url: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterData {
  description: string;
  columns: {
    product: FooterColumn;
    legal: FooterColumn;
    support: FooterColumn;
  };
  copyright: string;
  readyLink: {
    text: string;
    url: string;
  };
}

export default function Footer() {
  const { t } = useTranslation();
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_footer');
      if (saved) {
        try {
          setFooterData(JSON.parse(saved));
        } catch (e) {
          console.error('Fehler beim Laden der Footer-Daten:', e);
          setFooterData(null);
        }
      } else {
        setFooterData(null);
      }
    };

    loadData();

    // Listen for storage changes (when admin saves data)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website_footer') {
        loadData();
      }
    };

    // Listen for custom event (for same-tab updates)
    const handleCustomEvent = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  const description = footerData?.description || t('footer.description');
  const productTitle = footerData?.columns.product.title || t('footer.product.title');
  const legalTitle = footerData?.columns.legal.title || t('footer.legal.title');
  const supportTitle = footerData?.columns.support.title || t('footer.support.title');
  const copyright = footerData?.copyright || t('footer.copyright');
  const readyLinkText = footerData?.readyLink.text || 'Website Builder';
  const readyLinkUrl = footerData?.readyLink.url || 'https://readdy.ai/?ref=logo';

  const productLinks = footerData?.columns.product.links || [
    { label: t('footer.howItWorks'), url: '/#how-it-works' },
    { label: t('nav.aboutUs'), url: '/#about-us' },
    { label: t('footer.pricing'), url: '/#pricing' },
    { label: t('footer.faq'), url: '/#faq' },
    { label: t('footer.aiAssistant'), url: '/trial' }
  ];

  const legalLinks = footerData?.columns.legal.links || [
    { label: t('footer.imprint'), url: '/imprint' },
    { label: t('footer.privacy'), url: '/privacy' },
    { label: t('footer.terms'), url: '/terms' }
  ];

  const supportLinks = footerData?.columns.support.links || [
    { label: t('footer.support.contact'), url: 'mailto:support@ideaoracle.ai' },
    { label: t('footer.support.docs'), url: '/#how-it-works' },
    { label: t('footer.support.status'), url: 'https://status.ideaoracle.ai' }
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Prominent Support Email Banner */}
        <div className="mb-12 p-6 bg-gradient-to-r from-[#C9A961]/20 to-[#C9A961]/10 rounded-2xl border border-[#C9A961]/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#C9A961]/20 rounded-xl flex items-center justify-center">
                <i className="ri-customer-service-2-line text-[#C9A961] text-2xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{t('footer.support.needHelp', 'Brauchst du Hilfe?')}</h3>
                <p className="text-gray-400 text-sm">{t('footer.support.reachOut', 'Unser Support-Team ist für dich da')}</p>
              </div>
            </div>
            <a
              href="mailto:support@ideaoracle.ai"
              className="flex items-center gap-3 px-6 py-3 bg-[#C9A961] hover:bg-[#B8984F] text-[#0F1419] rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-[#C9A961]/20 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-mail-send-line text-lg"></i>
              support@ideaoracle.ai
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <i className="ri-compass-3-line text-2xl text-[#C9A961]"></i>
              </div>
              <span className="text-xl font-bold">IdeaOracle.ai</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {description}
            </p>
            {/* Email Link unter Brand */}
            <a
              href="mailto:support@ideaoracle.ai"
              className="inline-flex items-center gap-2 text-[#C9A961] hover:text-[#E0C078] transition-colors text-sm font-medium cursor-pointer"
            >
              <i className="ri-mail-line"></i>
              support@ideaoracle.ai
            </a>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">{productTitle}</h4>
            <ul className="space-y-3">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-[#C9A961] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{legalTitle}</h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-[#C9A961] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{supportTitle}</h4>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-[#C9A961] transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            {/* Zusätzliche Support-Info */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-500 mb-2">{t('footer.support.directContact', 'Direkter Kontakt:')}</p>
              <a
                href="mailto:support@ideaoracle.ai"
                className="flex items-center gap-2 text-[#C9A961] hover:text-[#E0C078] transition-colors text-sm cursor-pointer"
              >
                <i className="ri-mail-fill"></i>
                support@ideaoracle.ai
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">{copyright}</p>
          <a
            href={readyLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#C9A961] transition-colors text-sm"
          >
            {readyLinkText}
          </a>
        </div>
      </div>
    </footer>
  );
}
