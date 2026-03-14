import { saveWebsiteSettings } from '../supabase/database';

/**
 * Persist website editor data:
 * 1. localStorage  → instant same-tab preview
 * 2. custom event  → live update for components mounted in the same tab
 * 3. Supabase      → persists across all browsers / users
 */
export async function saveEditorData(key: string, data: unknown): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore storage quota errors
  }
  window.dispatchEvent(new Event('website_data_updated'));
  await saveWebsiteSettings(key, data);
}
