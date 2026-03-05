
import { useState, useEffect } from 'react';

interface SocialMedia {
  platform: string;
  icon: string;
  url: string;
  enabled: boolean;
}

const defaultSocials: SocialMedia[] = [
  { platform: 'Facebook', icon: 'ri-facebook-fill', url: '', enabled: false },
  { platform: 'Instagram', icon: 'ri-instagram-line', url: '', enabled: false },
  { platform: 'Twitter/X', icon: 'ri-twitter-x-line', url: '', enabled: false },
  { platform: 'LinkedIn', icon: 'ri-linkedin-fill', url: '', enabled: false },
  { platform: 'YouTube', icon: 'ri-youtube-fill', url: '', enabled: false },
  { platform: 'TikTok', icon: 'ri-tiktok-fill', url: '', enabled: false },
  { platform: 'GitHub', icon: 'ri-github-fill', url: '', enabled: false },
  { platform: 'Discord', icon: 'ri-discord-fill', url: '', enabled: false },
];

export default function SocialMediaEditor() {
  // ----- State -------------------------------------------------------------
  const [socials, setSocials] = useState<SocialMedia[]>(defaultSocials);
  const [saved, setSaved] = useState(false);

  // ----- Load from localStorage --------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem('websiteSocials');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Basic validation – ensure we have an array of objects with required keys
        if (Array.isArray(parsed)) {
          setSocials(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to parse stored social links:', e);
    }
  }, []);

  // ----- Save handler -------------------------------------------------------
  const handleSave = () => {
    try {
      localStorage.setItem('websiteSocials', JSON.stringify(socials));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Notify other parts of the app that the socials have changed
      window.dispatchEvent(new CustomEvent('websiteSocialsUpdated', { detail: socials }));
    } catch (e) {
      console.error('Failed to save social links:', e);
    }
  };

  // ----- Update a single field ---------------------------------------------
  const handleUpdate = (
    platform: string,
    field: keyof SocialMedia,
    value: string | boolean,
  ) => {
    setSocials((prev) =>
      prev.map((s) =>
        s.platform === platform ? { ...s, [field]: value } : s,
      ),
    );
  };

  // ----- Reset to defaults --------------------------------------------------
  const handleReset = () => {
    setSocials(defaultSocials);
  };

  // ----- Derived data -------------------------------------------------------
  const enabledCount = socials.filter((s) => s.enabled && s.url).length;

  // -------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-white mb-1">
          Social Media Links
        </h3>
        <p className="text-slate-400 text-sm">
          Verlinke deine Social‑Media‑Profile
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Verfügbar</p>
          <p className="text-2xl font-bold text-white">{socials.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Aktiviert</p>
          <p className="text-2xl font-bold text-green-400">{enabledCount}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Deaktiviert</p>
          <p className="text-2xl font-bold text-slate-400">
            {socials.length - enabledCount}
          </p>
        </div>
      </div>

      {/* Social Media List */}
      <div className="space-y-3">
        {socials.map((social) => (
          <div
            key={social.platform}
            className="bg-slate-800 rounded-lg p-4 border border-slate-700"
          >
            <div className="flex items-center gap-4">
              {/* Icon preview */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  social.enabled && social.url
                    ? 'bg-[#C9A961]/20'
                    : 'bg-slate-700'
                }`}
              >
                <i
                  className={`${social.icon} text-2xl ${
                    social.enabled && social.url
                      ? 'text-[#C9A961]'
                      : 'text-slate-500'
                  }`}
                />
              </div>

              {/* Platform name */}
              <div className="w-32">
                <p className="text-white font-medium">{social.platform}</p>
                <p className="text-slate-500 text-xs">{social.icon}</p>
              </div>

              {/* URL input */}
              <div className="flex-1">
                <input
                  type="url"
                  value={social.url}
                  onChange={(e) =>
                    handleUpdate(social.platform, 'url', e.target.value)
                  }
                  placeholder={`https://${social.platform
                    .toLowerCase()
                    .replace(/\s+/g, '')}.com/deinprofil`}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                />
              </div>

              {/* Enable / disable toggle */}
              <button
                onClick={() =>
                  handleUpdate(social.platform, 'enabled', !social.enabled)
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  social.enabled
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {social.enabled ? (
                  <>
                    <i className="ri-check-line mr-1" />
                    Aktiv
                  </>
                ) : (
                  <>
                    <i className="ri-close-line mr-1" />
                    Inaktiv
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
          Vorschau
        </h4>
        <div className="flex gap-3 flex-wrap">
          {socials.filter((s) => s.enabled && s.url).length > 0 ? (
            socials
              .filter((s) => s.enabled && s.url)
              .map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-700 hover:bg-[#C9A961] rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={social.platform}
                >
                  <i className={`${social.icon} text-lg`} />
                </a>
              ))
          ) : (
            <p className="text-slate-500 text-sm">
              Keine Social-Media-Links aktiviert
            </p>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <i className="ri-information-line text-blue-400 text-xl" />
          <div className="flex-1">
            <p className="text-blue-300 font-medium mb-1">Hinweis</p>
            <p className="text-blue-200 text-sm">
              Die Social-Media-Links werden automatisch im Footer angezeigt,
              sobald sie aktiviert sind und eine URL haben.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-[#C9A961] hover:bg-[#B89951] text-white rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap"
        >
          {saved ? '✓ Gespeichert!' : 'Speichern'}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap"
        >
          Zurücksetzen
        </button>
      </div>
    </div>
  );
}
