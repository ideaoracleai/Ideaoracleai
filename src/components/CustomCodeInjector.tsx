import { useEffect } from 'react';
import { getWebsiteSettings } from '../supabase/database';

interface CustomCode {
  css: string;
  js: string;
  headHtml: string;
  bodyHtml: string;
}

function applyCustomCode(code: Partial<CustomCode>) {
  const styleId = 'custom-admin-css';
  let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
  if (code.css) {
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = code.css;
  } else if (styleEl) {
    styleEl.textContent = '';
  }

  const headHtmlId = 'custom-admin-head-html';
  let headEl = document.getElementById(headHtmlId);
  if (code.headHtml) {
    if (!headEl) {
      headEl = document.createElement('div');
      headEl.id = headHtmlId;
      document.head.appendChild(headEl);
    }
    headEl.innerHTML = code.headHtml;
  }
}

export default function CustomCodeInjector() {
  useEffect(() => {
    const apply = (value: unknown) => {
      if (value && typeof value === 'object') {
        applyCustomCode(value as Partial<CustomCode>);
      }
    };

    try {
      const cached = localStorage.getItem('websiteCustomCode');
      if (cached) apply(JSON.parse(cached));
    } catch { /* ignore */ }

    getWebsiteSettings('websiteCustomCode').then(value => {
      if (value) {
        apply(value);
        localStorage.setItem('websiteCustomCode', JSON.stringify(value));
      }
    });

    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem('websiteCustomCode');
        if (cached) apply(JSON.parse(cached));
      } catch { /* ignore */ }
    };
    window.addEventListener('website_data_updated', handleUpdate);
    return () => window.removeEventListener('website_data_updated', handleUpdate);
  }, []);

  return null;
}
