import { useState, useEffect } from 'react';
import { getWebsiteSettings } from '../supabase/database';

/**
 * Hook that loads a website setting with a 3-layer strategy:
 * 1. Render immediately with localStorage cache (fast)
 * 2. Fetch authoritative value from Supabase (always fresh)
 * 3. React to same-tab and cross-tab updates in real time
 */
export function useWebsiteSettings<T>(key: string, defaultValue: T): T {
  const [data, setData] = useState<T>(() => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) return JSON.parse(cached) as T;
    } catch {
      // ignore
    }
    return defaultValue;
  });

  useEffect(() => {
    // Fetch from Supabase (authoritative source)
    getWebsiteSettings(key).then((value) => {
      if (value !== null) {
        setData(value as T);
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // ignore
        }
      }
    });

    // Same-tab updates (dispatched by saveEditorData)
    const handleUpdate = () => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) setData(JSON.parse(cached) as T);
      } catch {
        // ignore
      }
    };

    // Cross-tab / cross-browser updates via storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setData(JSON.parse(e.newValue) as T);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('website_data_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('website_data_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [key]);

  return data;
}
