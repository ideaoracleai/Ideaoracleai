import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { currentSubscription } from '../../../mocks/subscriptionData';
import { useAuth } from '../../../supabase';
import { uploadAvatar, updateUserDocument } from '../../../supabase/database';
import { SUPPORTED_LANGUAGES } from '../../../components/feature/LanguageSelector';

interface SettingsProps {
  onBack: () => void;
  onNavigateSubscription?: () => void;
}

export default function Settings({ onBack, onNavigateSubscription }: SettingsProps) {
  const { t, i18n } = useTranslation();
  const { userDoc, firebaseUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'account'>('profile');
  const [profileData, setProfileData] = useState({
    name: userDoc?.name || firebaseUser?.email?.split('@')[0] || 'User',
    email: userDoc?.email || firebaseUser?.email || '',
    phone: ''
  });
  const [preferences, setPreferences] = useState({
    language: i18n.language || 'de',
    timezone: 'Europe/Zurich',
    currency: 'CHF'
  });
  const [notifications, setNotifications] = useState({
    emailAnalysis: true,
    emailCredits: true,
    emailNewsletter: false,
    emailBilling: true,
    pushAnalysis: true,
    pushCredits: false
  });
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Avatar state — synced with userDoc.avatarUrl (single source of truth)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userDoc?.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep avatar in sync whenever userDoc updates (e.g. on realtime push or page reload)
  useEffect(() => {
    if (userDoc?.avatarUrl) {
      setAvatarPreview(userDoc.avatarUrl);
    }
  }, [userDoc?.avatarUrl]);

  // Keep profileData in sync when userDoc first loads
  useEffect(() => {
    if (userDoc) {
      setProfileData(prev => ({
        ...prev,
        name: userDoc.name || prev.name,
        email: userDoc.email || prev.email,
      }));
    }
  }, [userDoc?.name, userDoc?.email]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Avatar Upload Handler ─────────────────────────────────────────────────
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !firebaseUser?.id) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    setIsUploadingAvatar(true);
    try {
      const publicUrl = await uploadAvatar(firebaseUser.id, file);
      setAvatarPreview(publicUrl);
      showToast(t('settings.profile.photoUpdated'), 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      showToast(msg, 'error');
      // Revert preview on error
      setAvatarPreview(userDoc?.avatarUrl || null);
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Save Profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (firebaseUser?.id) {
      try {
        await updateUserDocument(firebaseUser.id, {
          name: profileData.name,
          language: preferences.language,
          selectedCurrency: preferences.currency,
        });
      } catch {
        // Silently continue — UI still updates
      }
    }
    if (preferences.language !== i18n.language) {
      i18n.changeLanguage(preferences.language);
    }
    setSaved(true);
    showToast(t('settings.saved'), 'success');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = () => {
    const exportData = {
      profile: profileData,
      preferences,
      notifications,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('settings.dataExported'), 'success');
  };

  const tabs = [
    { id: 'profile' as const, icon: 'ri-user-line', label: t('settings.tabs.profile') },
    { id: 'preferences' as const, icon: 'ri-settings-3-line', label: t('settings.tabs.preferences') },
    { id: 'notifications' as const, icon: 'ri-notification-line', label: t('settings.tabs.notifications') },
    { id: 'account' as const, icon: 'ri-shield-user-line', label: t('settings.tabs.account') }
  ];

  const emailNotificationItems = [
    { key: 'emailAnalysis' as const, title: t('settings.notifications.email.analysis'), desc: t('settings.notifications.email.analysisDesc') },
    { key: 'emailCredits' as const, title: t('settings.notifications.email.credits'), desc: t('settings.notifications.email.creditsDesc') },
    { key: 'emailBilling' as const, title: t('settings.notifications.email.billing'), desc: t('settings.notifications.email.billingDesc') },
    { key: 'emailNewsletter' as const, title: t('settings.notifications.email.newsletter'), desc: t('settings.notifications.email.newsletterDesc') }
  ];

  const pushNotificationItems = [
    { key: 'pushAnalysis' as const, title: t('settings.notifications.push.analysis'), desc: t('settings.notifications.push.analysisDesc') },
    { key: 'pushCredits' as const, title: t('settings.notifications.push.credits'), desc: t('settings.notifications.push.creditsDesc') }
  ];

  const deleteWord = i18n.language === 'de' ? 'LÖSCHEN' : 'DELETE';
  const userInitial = profileData.name.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease] ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' :
          toast.type === 'error' ? 'bg-red-500/90 text-white' :
            'bg-[#C9A961]/90 text-[#0F1419]'
          }`}>
          <i className={`${toast.type === 'success' ? 'ri-check-line' :
            toast.type === 'error' ? 'ri-error-warning-line' :
              'ri-information-line'
            } text-lg`}></i>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line"></i>
          {t('settings.backToOverview')}
        </button>
        {onNavigateSubscription && (
          <button
            onClick={onNavigateSubscription}
            className="flex items-center gap-2 text-gray-400 hover:text-[#C9A961] transition-colors cursor-pointer whitespace-nowrap text-sm"
          >
            <i className="ri-bank-card-line"></i>
            {t('settings.subscriptionLink')}
          </button>
        )}
      </div>

      <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#3D3428]/30">
          <h1 className="text-2xl font-bold text-white mb-2">{t('settings.title')}</h1>
          <p className="text-gray-400 text-sm">{t('settings.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#3D3428]/30 overflow-x-auto relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .overflow-x-auto::-webkit-scrollbar { display: none; }
          `}</style>
          <div className="flex gap-2 p-2 items-center w-max min-w-full">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* ─── Profile Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <div className="flex items-center gap-5 mb-6">
                {/* Avatar Circle */}
                <div className="relative group">
                  <div
                    onClick={handleAvatarClick}
                    className="w-20 h-20 rounded-full overflow-hidden cursor-pointer ring-2 ring-[#C9A961]/30 hover:ring-[#C9A961]/60 transition-all"
                  >
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#C9A961] to-[#A08748] flex items-center justify-center">
                        <span className="text-[#0F1419] text-2xl font-bold">{userInitial}</span>
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploadingAvatar ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <i className="ri-camera-line text-white text-xl"></i>
                      )}
                    </div>
                  </div>
                  {/* Upload progress ring */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-full border-2 border-[#C9A961] border-t-transparent animate-spin"></div>
                  )}
                </div>

                <div>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm font-medium text-white hover:border-[#C9A961]/30 hover:text-[#C9A961] transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploadingAvatar ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        {t('settings.profile.uploading')}
                      </>
                    ) : (
                      <>
                        <i className="ri-camera-line"></i>
                        {t('settings.profile.changePhoto')}
                      </>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">{t('settings.profile.photoHint')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">{t('settings.profile.name')}</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">{t('settings.profile.email')}</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">{t('settings.profile.phone')}</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#3D3428]/30">
                <h3 className="text-white font-semibold mb-3">{t('settings.profile.changePassword')}</h3>
                <div className="space-y-3">
                  <input type="password" placeholder={t('settings.profile.currentPassword')} className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm" />
                  <input type="password" placeholder={t('settings.profile.newPassword')} className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm" />
                  <input type="password" placeholder={t('settings.profile.confirmPassword')} className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* ─── Preferences Tab ─────────────────────────────────────────────── */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">{t('settings.preferences.language')}</label>
                <select
                  value={preferences.language}
                  onChange={async (e) => {
                    const newLang = e.target.value;
                    setPreferences({ ...preferences, language: newLang });
                    i18n.changeLanguage(newLang);
                    // Persist immediately to Supabase
                    if (firebaseUser?.id) {
                      try {
                        await updateUserDocument(firebaseUser.id, { language: newLang });
                      } catch { /* ignore */ }
                    }
                  }}
                  className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">{t('settings.preferences.timezone')}</label>
                <select
                  value={preferences.timezone}
                  onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm cursor-pointer"
                >
                  <option value="Europe/Zurich">Europe/Zürich (GMT+1)</option>
                  <option value="Europe/Berlin">Europe/Berlin (GMT+1)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                  <option value="America/New_York">America/New York (GMT-5)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">{t('settings.preferences.currency')}</label>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white focus:outline-none focus:border-[#C9A961]/30 text-sm cursor-pointer"
                >
                  <option value="CHF">CHF (Fr)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          )}

          {/* ─── Notifications Tab ───────────────────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-semibold mb-4">{t('settings.notifications.emailTitle')}</h3>
                <div className="space-y-3">
                  {emailNotificationItems.map(item => (
                    <label key={item.key} className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg cursor-pointer hover:bg-[#0F1419]/80 transition-colors">
                      <div>
                        <p className="text-white font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="w-5 h-5 rounded border-[#3D3428]/30 bg-[#0F1419] text-[#C9A961] focus:ring-[#C9A961] cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">{t('settings.notifications.pushTitle')}</h3>
                <div className="space-y-3">
                  {pushNotificationItems.map(item => (
                    <label key={item.key} className="flex items-center justify-between p-4 bg-[#0F1419] rounded-lg cursor-pointer hover:bg-[#0F1419]/80 transition-colors">
                      <div>
                        <p className="text-white font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-gray-400">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                        className="w-5 h-5 rounded border-[#3D3428]/30 bg-[#0F1419] text-[#C9A961] focus:ring-[#C9A961] cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Account Tab ─────────────────────────────────────────────────── */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">{t('settings.account.currentSubscription')}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-400/10">
                    {currentSubscription.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400">{t('settings.account.plan')}</div>
                    <div className="text-white font-bold">{userDoc?.plan || currentSubscription.plan}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">{t('settings.account.price')}</div>
                    <div className="text-white font-bold">CHF {currentSubscription.price.toFixed(2)}/Mo</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">{t('settings.account.nextBilling')}</div>
                    <div className="text-white font-bold text-sm">{currentSubscription.nextBilling}</div>
                  </div>
                </div>
                {onNavigateSubscription && (
                  <button
                    onClick={onNavigateSubscription}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1A1F26] border border-[#C9A961]/30 rounded-lg text-sm text-[#C9A961] font-medium hover:bg-[#C9A961]/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-bank-card-line"></i>
                    {t('settings.account.manageSubscription')}
                  </button>
                )}
              </div>

              <div className="bg-[#0F1419] border border-[#3D3428]/30 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">{t('settings.account.dataPrivacy')}</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-sm font-medium text-white hover:border-[#C9A961]/30 hover:text-[#C9A961] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span className="flex items-center gap-2">
                      <i className="ri-download-line"></i>
                      {t('settings.account.exportData')}
                    </span>
                    <i className="ri-arrow-right-s-line text-gray-400"></i>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#1A1F26] border border-red-500/30 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <span className="flex items-center gap-2">
                      <i className="ri-delete-bin-line"></i>
                      {t('settings.account.deleteAccount')}
                    </span>
                    <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Save Button ─────────────────────────────────────────────────── */}
          {activeTab !== 'account' && (
            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#3D3428]/30">
              {saved && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <i className="ri-check-line"></i>
                  {t('settings.changesSaved')}
                </div>
              )}
              <button
                onClick={handleSave}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-check-line"></i>
                {t('settings.saveChanges')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Delete Account Modal ─────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-[#1A1F26] border border-[#3D3428]/30 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-error-warning-line text-red-400 text-2xl"></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{t('settings.deleteModal.title')}</h2>
                <p className="text-gray-400 text-sm">{t('settings.deleteModal.subtitle')}</p>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <ul className="space-y-2 text-sm text-red-300">
                <li className="flex items-start gap-2"><i className="ri-close-circle-line mt-0.5"></i><span>{t('settings.deleteModal.warning1')}</span></li>
                <li className="flex items-start gap-2"><i className="ri-close-circle-line mt-0.5"></i><span>{t('settings.deleteModal.warning2')}</span></li>
                <li className="flex items-start gap-2"><i className="ri-close-circle-line mt-0.5"></i><span>{t('settings.deleteModal.warning3')}</span></li>
              </ul>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                {t('settings.deleteModal.confirmLabel', { word: deleteWord })}
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={deleteWord}
                className="w-full px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961]/30 text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F1419] border border-[#3D3428]/30 rounded-lg text-sm font-medium text-white hover:border-[#3D3428]/50 transition-all cursor-pointer whitespace-nowrap"
              >
                {t('settings.deleteModal.cancel')}
              </button>
              <button
                disabled={deleteConfirm !== deleteWord}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${deleteConfirm === deleteWord ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'}`}
              >
                <i className="ri-delete-bin-line"></i>
                {t('settings.deleteModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
