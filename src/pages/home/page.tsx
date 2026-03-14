import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import AboutUs from './components/AboutUs';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import SeoHead from '../../components/SeoHead';
import { getWebsiteSettings } from '../../supabase/database';

interface SectionConfig {
  id: string;
  label: string;
  visible: boolean;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'hero', label: 'Hero', visible: true },
  { id: 'features', label: 'Features', visible: true },
  { id: 'howItWorks', label: 'How It Works', visible: true },
  { id: 'testimonials', label: 'Testimonials', visible: true },
  { id: 'aboutUs', label: 'About Us', visible: true },
  { id: 'pricing', label: 'Pricing', visible: true },
  { id: 'faq', label: 'FAQ', visible: true },
];

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: Hero,
  features: Features,
  howItWorks: HowItWorks,
  howitworks: HowItWorks,
  testimonials: Testimonials,
  aboutUs: AboutUs,
  about: AboutUs,
  pricing: Pricing,
  faq: FAQ,
  cta: CTA,
};

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const apply = (value: unknown) => {
      if (Array.isArray(value) && value.length > 0) {
        setSections(value as SectionConfig[]);
      }
    };
    try {
      const cached = localStorage.getItem('sectionOrder');
      if (cached) apply(JSON.parse(cached));
    } catch { /* ignore */ }
    getWebsiteSettings('sectionOrder').then(value => {
      if (value) {
        apply(value);
        localStorage.setItem('sectionOrder', JSON.stringify(value));
      }
    });
    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('sectionOrder');
        if (cached) apply(JSON.parse(cached));
      } catch { /* ignore */ }
    };
    window.addEventListener('website_data_updated', handleUpdate);
    return () => window.removeEventListener('website_data_updated', handleUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F1419]">
      <SeoHead />
      <Navbar isScrolled={isScrolled} />
      {sections
        .filter(s => s.visible)
        .map(s => {
          const Component = SECTION_COMPONENTS[s.id];
          return Component ? <Component key={s.id} /> : null;
        })}
      <Footer />
    </div>
  );
}
