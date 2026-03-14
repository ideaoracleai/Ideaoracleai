import { useEffect } from 'react';
import { getWebsiteSettings } from '../supabase/database';

interface SeoData {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
}

const defaults: SeoData = {
  title: 'IdeaOracle.ai - AI-Powered Idea Validation Platform',
  description: 'IdeaOracle.ai uses advanced AI to validate your business ideas, provide honest feedback, and help you make informed decisions.',
  keywords: 'idea validation, AI feedback, business ideas, startup validation, IdeaOracle.ai',
  ogTitle: 'IdeaOracle.ai - AI-Powered Idea Validation',
  ogDescription: 'Get brutally honest AI feedback on your business ideas in seconds.',
  ogImage: '',
  ogUrl: 'https://ideaoracle.ai/',
  twitterCard: 'summary_large_image',
  twitterTitle: 'IdeaOracle.ai - AI-Powered Idea Validation',
  twitterDescription: 'Get brutally honest AI feedback on your business ideas in seconds.',
};

function setMeta(name: string, content: string, prop = false) {
  if (!content) return;
  const attr = prop ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function applySeo(raw: Partial<SeoData>) {
  const d: SeoData = { ...defaults, ...raw };
  document.title = d.title;
  setMeta('description', d.description);
  setMeta('keywords', d.keywords);
  setMeta('og:type', 'website', true);
  setMeta('og:title', d.ogTitle, true);
  setMeta('og:description', d.ogDescription, true);
  setMeta('og:url', d.ogUrl, true);
  if (d.ogImage) setMeta('og:image', d.ogImage, true);
  setMeta('twitter:card', d.twitterCard);
  setMeta('twitter:title', d.twitterTitle);
  setMeta('twitter:description', d.twitterDescription);
  setLink('canonical', d.ogUrl);
}

function injectStructuredData(data: object) {
  const id = 'seo-structured-data';
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function SeoHead() {
  useEffect(() => {
    const apply = (value: unknown) => {
      if (value && typeof value === 'object') {
        applySeo(value as Partial<SeoData>);
      }
    };

    try {
      const cached = localStorage.getItem('website_seo');
      if (cached) apply(JSON.parse(cached));
      else applySeo({});
    } catch {
      applySeo({});
    }

    getWebsiteSettings('website_seo').then(value => {
      if (value) {
        apply(value);
        localStorage.setItem('website_seo', JSON.stringify(value));
      }
    });

    getWebsiteSettings('advancedSeoSettings').then(value => {
      if (!value || typeof value !== 'object') return;
      const adv = value as Record<string, unknown>;
      const sd = adv.structuredData as Record<string, unknown> | undefined;
      if (!sd) return;
      const graph: object[] = [];
      const org = sd.organization as Record<string, unknown> | undefined;
      if (org?.enabled) {
        graph.push({
          '@type': 'Organization',
          name: org.name,
          url: org.url,
          logo: org.logo,
          description: org.description,
          contactPoint: { '@type': 'ContactPoint', email: org.contactEmail, telephone: org.contactPhone },
        });
      }
      const web = sd.website as Record<string, unknown> | undefined;
      if (web?.enabled) {
        graph.push({ '@type': 'WebSite', name: web.name, url: web.url, description: web.description });
      }
      if (graph.length > 0) {
        injectStructuredData({ '@context': 'https://schema.org', '@graph': graph });
      }
    });

    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('website_seo');
        if (cached) apply(JSON.parse(cached));
      } catch { /* ignore */ }
    };
    window.addEventListener('website_data_updated', handleUpdate);
    return () => window.removeEventListener('website_data_updated', handleUpdate);
  }, []);

  return null;
}
