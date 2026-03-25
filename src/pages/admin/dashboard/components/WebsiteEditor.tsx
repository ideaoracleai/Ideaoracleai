import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeroEditor from './editors/HeroEditor';
import NavbarEditor from './editors/NavbarEditor';
import FeaturesEditor from './editors/FeaturesEditor';
import HowItWorksEditor from './editors/HowItWorksEditor';
import TestimonialsEditor from './editors/TestimonialsEditor';
import AboutEditor from './editors/AboutEditor';
import CtaEditor from './editors/CtaEditor';
import PricingEditor from './editors/PricingEditor';
import FaqEditor from './editors/FaqEditor';
import FooterEditor from './editors/FooterEditor';
import LegalEditor from './editors/LegalEditor';
import SeoEditor from './editors/SeoEditor';
import ImportExportEditor from './editors/ImportExportEditor';
import DesignEditor from './editors/DesignEditor';
import SectionOrderEditor from './editors/SectionOrderEditor';
import MediaEditor from './editors/MediaEditor';
import CustomCodeEditor from './editors/CustomCodeEditor';
import SocialMediaEditor from './editors/SocialMediaEditor';
import AdvancedSeoEditor from './editors/AdvancedSeoEditor';
import VersionHistoryEditor from './editors/VersionHistoryEditor';
import InvoiceEditor from './editors/InvoiceEditor';
import ChatWidgetEditor from './editors/ChatWidgetEditor';

type TabId = 'navbar' | 'hero' | 'features' | 'howitworks' | 'testimonials' | 'about' | 'cta' | 'pricing' | 'faq' | 'footer' | 'legal' | 'seo' | 'importexport' | 'design' | 'sections' | 'media' | 'customcode' | 'socials' | 'advancedseo' | 'versions' | 'invoice' | 'chatwidget';

export default function WebsiteEditor() {
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const { t } = useTranslation();

  const tabs: { id: TabId; label: string; icon: string; group: string }[] = [
    { id: 'navbar', label: t('admin.websiteEditor.tab.navbar', 'Navigation'), icon: 'ri-menu-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'hero', label: 'Hero', icon: 'ri-home-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'features', label: 'Features', icon: 'ri-star-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'howitworks', label: t('admin.websiteEditor.tab.howitworks', 'How It Works'), icon: 'ri-list-ordered', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'testimonials', label: 'Testimonials', icon: 'ri-chat-quote-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'about', label: t('admin.websiteEditor.tab.about', 'About Us'), icon: 'ri-information-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'pricing', label: t('admin.websiteEditor.tab.pricing', 'Pricing'), icon: 'ri-price-tag-3-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'faq', label: 'FAQ', icon: 'ri-question-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'cta', label: 'CTA', icon: 'ri-megaphone-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'footer', label: 'Footer', icon: 'ri-layout-bottom-line', group: t('admin.websiteEditor.group.structure', 'Page Structure') },
    { id: 'design', label: 'Design', icon: 'ri-palette-line', group: t('admin.websiteEditor.group.design', 'Design & Layout') },
    { id: 'sections', label: t('admin.websiteEditor.tab.sections', 'Sections'), icon: 'ri-layout-grid-line', group: t('admin.websiteEditor.group.design', 'Design & Layout') },
    { id: 'media', label: t('admin.websiteEditor.tab.media', 'Media'), icon: 'ri-image-line', group: t('admin.websiteEditor.group.design', 'Design & Layout') },
    { id: 'customcode', label: 'Custom Code', icon: 'ri-code-line', group: t('admin.websiteEditor.group.design', 'Design & Layout') },
    { id: 'chatwidget', label: t('admin.websiteEditor.tab.chatwidget', 'Talk with Us'), icon: 'ri-chat-voice-line', group: t('admin.websiteEditor.group.settings', 'Settings') },
    { id: 'invoice', label: t('admin.websiteEditor.tab.invoice', 'Invoices'), icon: 'ri-file-list-3-line', group: t('admin.websiteEditor.group.settings', 'Settings') },
    { id: 'socials', label: 'Social Media', icon: 'ri-share-line', group: t('admin.websiteEditor.group.settings', 'Settings') },
    { id: 'legal', label: t('admin.websiteEditor.tab.legal', 'Legal'), icon: 'ri-file-text-line', group: t('admin.websiteEditor.group.settings', 'Settings') },
    { id: 'seo', label: t('admin.websiteEditor.tab.seo', 'SEO Basic'), icon: 'ri-search-line', group: t('admin.websiteEditor.group.settings', 'Settings') },
    { id: 'advancedseo', label: t('admin.websiteEditor.tab.advancedseo', 'SEO Advanced'), icon: 'ri-search-2-line', group: t('admin.websiteEditor.group.settings', 'Settings') },
    { id: 'versions', label: t('admin.websiteEditor.tab.versions', 'Versions'), icon: 'ri-history-line', group: t('admin.websiteEditor.group.settings', 'Settings') },
    { id: 'importexport', label: 'Import/Export', icon: 'ri-download-upload-line', group: t('admin.websiteEditor.group.settings', 'Settings') }
  ];

  const groups = [...new Set(tabs.map(t => t.group))];

  return (
    <div className="bg-slate-900 rounded-lg shadow-sm border border-slate-700">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#C9A961]/20 rounded-lg flex items-center justify-center">
              <i className="ri-palette-line text-[#C9A961] text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t('admin.websiteEditor.title', 'Website Editor')}</h2>
              <p className="text-slate-400 text-xs">{t('admin.websiteEditor.subtitle', 'Edit all sections of the homepage')}</p>
            </div>
          </div>
          <a
            href="/"
            target="_blank"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-external-link-line"></i> {t('admin.websiteEditor.openPreview', 'Open Preview')}
          </a>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-56 border-r border-slate-700 p-3 space-y-4 min-h-[600px] max-h-[700px] overflow-y-auto">
          {groups.map(group => (
            <div key={group}>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider px-3 mb-2">{group}</p>
              <div className="space-y-1">
                {tabs.filter(t => t.group === group).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-[#C9A961]/20 text-[#C9A961]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <i className={`${tab.icon} text-base`}></i>
                    <span className="truncate">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-h-[700px] overflow-y-auto">
          {activeTab === 'navbar' && <NavbarEditor />}
          {activeTab === 'hero' && <HeroEditor onSave={() => {}} />}
          {activeTab === 'features' && <FeaturesEditor />}
          {activeTab === 'howitworks' && <HowItWorksEditor />}
          {activeTab === 'testimonials' && <TestimonialsEditor />}
          {activeTab === 'about' && <AboutEditor />}
          {activeTab === 'cta' && <CtaEditor />}
          {activeTab === 'pricing' && <PricingEditor onSave={() => {}} />}
          {activeTab === 'faq' && <FaqEditor onSave={() => {}} />}
          {activeTab === 'footer' && <FooterEditor />}
          {activeTab === 'design' && <DesignEditor />}
          {activeTab === 'sections' && <SectionOrderEditor />}
          {activeTab === 'media' && <MediaEditor />}
          {activeTab === 'customcode' && <CustomCodeEditor />}
          {activeTab === 'socials' && <SocialMediaEditor />}
          {activeTab === 'legal' && <LegalEditor onSave={() => {}} />}
          {activeTab === 'seo' && <SeoEditor onSave={() => {}} />}
          {activeTab === 'advancedseo' && <AdvancedSeoEditor />}
          {activeTab === 'versions' && <VersionHistoryEditor />}
          {activeTab === 'importexport' && <ImportExportEditor />}
          {activeTab === 'invoice' && <InvoiceEditor />}
          {activeTab === 'chatwidget' && <ChatWidgetEditor />}
        </div>
      </div>
    </div>
  );
}
