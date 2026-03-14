import { useEffect } from 'react';
import { getWebsiteSettings } from '../supabase/database';

interface DesignSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  fontFamily: string;
  headingFont: string;
}

const defaults: DesignSettings = {
  primaryColor: '#C9A961',
  secondaryColor: '#7BA882',
  accentColor: '#D4A5A5',
  backgroundColor: '#FFFFFF',
  textColor: '#1E293B',
  headingColor: '#0F172A',
  fontFamily: 'Inter, sans-serif',
  headingFont: 'Inter, sans-serif',
};

function applyDesign(d: Partial<DesignSettings>) {
  const s = { ...defaults, ...d };
  const root = document.documentElement;
  root.style.setProperty('--color-primary', s.primaryColor);
  root.style.setProperty('--color-secondary', s.secondaryColor);
  root.style.setProperty('--color-accent', s.accentColor);
  root.style.setProperty('--color-bg', s.backgroundColor);
  root.style.setProperty('--color-text', s.textColor);
  root.style.setProperty('--color-heading', s.headingColor);
  root.style.setProperty('--font-body', s.fontFamily);
  root.style.setProperty('--font-heading', s.headingFont);
}

export default function DesignApplier() {
  useEffect(() => {
    try {
      const cached = localStorage.getItem('websiteDesign');
      if (cached) applyDesign(JSON.parse(cached));
    } catch { /* ignore */ }

    getWebsiteSettings('websiteDesign').then(value => {
      if (value && typeof value === 'object') {
        applyDesign(value as Partial<DesignSettings>);
        localStorage.setItem('websiteDesign', JSON.stringify(value));
      }
    });

    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('websiteDesign');
        if (cached) applyDesign(JSON.parse(cached));
      } catch { /* ignore */ }
    };
    window.addEventListener('website_data_updated', handleUpdate);
    return () => window.removeEventListener('website_data_updated', handleUpdate);
  }, []);

  return null;
}
