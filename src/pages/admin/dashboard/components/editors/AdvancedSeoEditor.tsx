
import { useState, useEffect } from 'react';

interface AdvancedSeoSettings {
  robotsTxt: string;
  sitemapEnabled: boolean;
  sitemapFrequency: string;
  canonicalUrls: {
    home: string;
    pricing: string;
    faq: string;
    about: string;
  };
  structuredData: {
    organization: {
      enabled: boolean;
      name: string;
      url: string;
      logo: string;
      description: string;
      contactEmail: string;
      contactPhone: string;
    };
    website: {
      enabled: boolean;
      name: string;
      url: string;
      description: string;
    };
    faqPage: {
      enabled: boolean;
    };
  };
}

const defaultSettings: AdvancedSeoSettings = {
  robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/

Sitemap: https://ideaoracle.ai/sitemap.xml`,
  sitemapEnabled: true,
  sitemapFrequency: 'weekly',
  canonicalUrls: {
    home: 'https://ideaoracle.ai/',
    pricing: 'https://ideaoracle.ai/#pricing',
    faq: 'https://ideaoracle.ai/#faq',
    about: 'https://ideaoracle.ai/#about',
  },
  structuredData: {
    organization: {
      enabled: true,
      name: 'IdeaOracle.ai',
      url: 'https://ideaoracle.ai',
      logo: 'https://ideaoracle.ai/logo.png',
      description: 'AI-Powered Idea Validation Platform',
      contactEmail: 'info@ideaoracle.ai',
      contactPhone: '+41 44 123 45 67',
    },
    website: {
      enabled: true,
      name: 'IdeaOracle.ai',
      url: 'https://ideaoracle.ai',
      description: 'Get brutally honest AI feedback on your business ideas in seconds',
    },
    faqPage: {
      enabled: true,
    },
  },
};

export default function AdvancedSeoEditor() {
  const [settings, setSettings] = useState<AdvancedSeoSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'robots' | 'sitemap' | 'canonical' | 'structured'>('robots');

  // Load saved settings from localStorage (with error handling)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('advancedSeoSettings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to parse stored SEO settings:', err);
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('advancedSeoSettings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      window.dispatchEvent(new CustomEvent('advancedSeoUpdated', { detail: settings }));
    } catch (err) {
      console.error('Failed to save SEO settings:', err);
    }
  };

  const handleReset = () => {
    if (confirm('Alle erweiterten SEO-Einstellungen zurücksetzen?')) {
      setSettings(defaultSettings);
    }
  };

  const generateStructuredDataPreview = () => {
    const data: any = {
      '@context': 'https://schema.org',
      '@graph': [],
    };

    if (settings.structuredData.organization.enabled) {
      data['@graph'].push({
        '@type': 'Organization',
        name: settings.structuredData.organization.name,
        url: settings.structuredData.organization.url,
        logo: settings.structuredData.organization.logo,
        description: settings.structuredData.organization.description,
        contactPoint: {
          '@type': 'ContactPoint',
          email: settings.structuredData.organization.contactEmail,
          telephone: settings.structuredData.organization.contactPhone,
        },
      });
    }

    if (settings.structuredData.website.enabled) {
      data['@graph'].push({
        '@type': 'WebSite',
        name: settings.structuredData.website.name,
        url: settings.structuredData.website.url,
        description: settings.structuredData.website.description,
      });
    }

    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-1">Erweiterte SEO-Einstellungen</h3>
        <p className="text-slate-400 text-sm">
          Robots.txt, Sitemap, Canonical URLs und Structured Data
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {[
          { id: 'robots' as const, label: 'Robots.txt', icon: 'ri-robot-line' },
          { id: 'sitemap' as const, label: 'Sitemap', icon: 'ri-map-line' },
          { id: 'canonical' as const, label: 'Canonical URLs', icon: 'ri-link' },
          { id: 'structured' as const, label: 'Structured Data', icon: 'ri-code-box-line' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-[#C9A961] text-[#C9A961]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Robots.txt */}
      {activeTab === 'robots' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Robots.txt Inhalt *
            </label>
            <textarea
              value={settings.robotsTxt}
              onChange={(e) => setSettings({ ...settings, robotsTxt: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono resize-none"
            />
            <p className="text-slate-500 text-xs mt-2">
              Steuert, welche Bereiche von Suchmaschinen gecrawlt werden dürfen
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <i className="ri-information-line text-blue-400 text-xl"></i>
              <div className="flex-1">
                <p className="text-blue-300 font-medium mb-1">Hinweis</p>
                <p className="text-blue-200 text-sm">
                  Die robots.txt wird automatisch unter /robots.txt bereitgestellt. Stelle sicher,
                  dass sensible Bereiche wie /admin/ und /dashboard/ blockiert sind.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sitemap */}
      {activeTab === 'sitemap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div>
              <p className="text-white font-medium">Sitemap aktivieren</p>
              <p className="text-slate-400 text-sm">
                Automatische XML-Sitemap-Generierung
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, sitemapEnabled: !settings.sitemapEnabled })
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                settings.sitemapEnabled
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {settings.sitemapEnabled ? 'Aktiviert' : 'Deaktiviert'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Update-Frequenz
            </label>
            <select
              value={settings.sitemapFrequency}
              onChange={(e) =>
                setSettings({ ...settings, sitemapFrequency: e.target.value })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm cursor-pointer"
            >
              <option value="always">Immer (always)</option>
              <option value="hourly">Stündlich (hourly)</option>
              <option value="daily">Täglich (daily)</option>
              <option value="weekly">Wöchentlich (weekly)</option>
              <option value="monthly">Monatlich (monthly)</option>
              <option value="yearly">Jährlich (yearly)</option>
              <option value="never">Nie (never)</option>
            </select>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">Sitemap-Vorschau</h4>
            <pre className="text-slate-300 text-xs font-mono overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ideaoracle.ai/</loc>
    <changefreq>${settings.sitemapFrequency}</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ideaoracle.ai/trial</loc>
    <changefreq>${settings.sitemapFrequency}</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`}
            </pre>
          </div>
        </div>
      )}

      {/* Canonical URLs */}
      {activeTab === 'canonical' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <i className="ri-information-line text-blue-400 text-xl"></i>
              <div className="flex-1">
                <p className="text-blue-300 font-medium mb-1">Was sind Canonical URLs?</p>
                <p className="text-blue-200 text-sm">
                  Canonical URLs helfen Suchmaschinen, die bevorzugte Version einer Seite zu
                  identifizieren und Duplicate Content zu vermeiden.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(settings.canonicalUrls).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">
                  {key} Seite *
                </label>
                <input
                  type="url"
                  value={value}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      canonicalUrls: { ...settings.canonicalUrls, [key]: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                  placeholder="https://ideaoracle.ai/..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Data */}
      {activeTab === 'structured' && (
        <div className="space-y-4">
          {/* Organization */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-medium">Organization Schema</h4>
                <p className="text-slate-400 text-sm">Informationen über dein Unternehmen</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    structuredData: {
                      ...settings.structuredData,
                      organization: {
                        ...settings.structuredData.organization,
                        enabled: !settings.structuredData.organization.enabled,
                      },
                    },
                  })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  settings.structuredData.organization.enabled
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {settings.structuredData.organization.enabled ? 'Aktiviert' : 'Deaktiviert'}
              </button>
            </div>

            {settings.structuredData.organization.enabled && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={settings.structuredData.organization.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          structuredData: {
                            ...settings.structuredData,
                            organization: {
                              ...settings.structuredData.organization,
                              name: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={settings.structuredData.organization.url}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          structuredData: {
                            ...settings.structuredData,
                            organization: {
                              ...settings.structuredData.organization,
                              url: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={settings.structuredData.organization.logo}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        structuredData: {
                          ...settings.structuredData,
                          organization: {
                            ...settings.structuredData.organization,
                            logo: e.target.value,
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={settings.structuredData.organization.description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        structuredData: {
                          ...settings.structuredData,
                          organization: {
                            ...settings.structuredData.organization,
                            description: e.target.value,
                          },
                        },
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Kontakt E-Mail
                    </label>
                    <input
                      type="email"
                      value={settings.structuredData.organization.contactEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          structuredData: {
                            ...settings.structuredData,
                            organization: {
                              ...settings.structuredData.organization,
                              contactEmail: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Kontakt Telefon
                    </label>
                    <input
                      type="tel"
                      value={settings.structuredData.organization.contactPhone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          structuredData: {
                            ...settings.structuredData,
                            organization: {
                              ...settings.structuredData.organization,
                              contactPhone: e.target.value,
                            },
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Website */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-medium">WebSite Schema</h4>
                <p className="text-slate-400 text-sm">Informationen über deine Website</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    structuredData: {
                      ...settings.structuredData,
                      website: {
                        ...settings.structuredData.website,
                        enabled: !settings.structuredData.website.enabled,
                      },
                    },
                  })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  settings.structuredData.website.enabled
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {settings.structuredData.website.enabled ? 'Aktiviert' : 'Deaktiviert'}
              </button>
            </div>

            {settings.structuredData.website.enabled && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={settings.structuredData.website.name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          structuredData: {
                            ...settings.structuredData,
                            website: { ...settings.structuredData.website, name: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={settings.structuredData.website.url}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          structuredData: {
                            ...settings.structuredData,
                            website: { ...settings.structuredData.website, url: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Beschreibung
                  </label>
                  <textarea
                    value={settings.structuredData.website.description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        structuredData: {
                          ...settings.structuredData,
                          website: {
                            ...settings.structuredData.website,
                            description: e.target.value,
                          },
                        },
                      })
                    }
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* FAQ Page */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">FAQPage Schema</h4>
                <p className="text-slate-400 text-sm">Strukturierte Daten für FAQ-Bereich</p>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    structuredData: {
                      ...settings.structuredData,
                      faqPage: { enabled: !settings.structuredData.faqPage.enabled },
                    },
                  })
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                  settings.structuredData.faqPage.enabled
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {settings.structuredData.faqPage.enabled ? 'Aktiviert' : 'Deaktiviert'}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-sm font-semibold text-white mb-3">JSON-LD Vorschau</h4>
            <pre className="text-slate-300 text-xs font-mono overflow-x-auto max-h-64">
              {generateStructuredDataPreview()}
            </pre>
          </div>
        </div>
      )}

      {/* Buttons */}
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
