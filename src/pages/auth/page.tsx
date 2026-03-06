import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import LanguageSelector from '../../components/feature/LanguageSelector';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  forgotPassword,
  resendVerificationEmail,
  getPlanCredits,
  useAuth,
} from '../../supabase';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot' | 'reset';
type PlanType = 'starter' | 'pro' | 'builder';

interface PlanFeature {
  text: string;
  isCommon: boolean;
  isNegative?: boolean;
  isSpecial?: boolean;
}

interface Plan {
  id: PlanType;
  nameKey: string;
  price: string;
  yearlyPrice: string;
  creditsKey: string;
  descriptionKey: string;
  popular?: boolean;
  isBuilder?: boolean;
  hasDiscount: boolean;
  features: PlanFeature[];
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  selectedPlan: PlanType;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  couponCode: string;
}

interface ValidatedCoupon {
  code: string;
  plan: PlanType;
  duration: number;
  durationUnit: 'days' | 'months';
  credits: number;
  isValid: boolean;
}

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(() => {
    const urlMode = searchParams.get('mode');
    return urlMode === 'register' ? 'register' : 'login';
  });

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, authLoading, navigate]);

  // Initialize billing type from URL params
  const [isYearly, setIsYearly] = useState(() => {
    return searchParams.get('billing') === 'yearly';
  });

  // Initialize selected plan from URL params
  const [formData, setFormData] = useState<FormData>(() => {
    const urlPlan = searchParams.get('plan') as PlanType | null;
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      selectedPlan: urlPlan && ['starter', 'pro', 'builder'].includes(urlPlan) ? urlPlan : 'starter',
      acceptTerms: false,
      acceptPrivacy: false,
      couponCode: '',
    };
  });
  const [errors, setErrors] = useState<Partial<FormData & { general: string }>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Coupon State
  const [validatedCoupon, setValidatedCoupon] = useState<ValidatedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Email Verification State
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationError, setVerificationError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Resend Timer Effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const plans: Plan[] = [
    {
      id: 'starter',
      nameKey: 'pricing.starter.name',
      price: '39.90',
      yearlyPrice: '39.90',
      creditsKey: 'pricing.starter.credits',
      descriptionKey: 'pricing.starter.description',
      hasDiscount: false,
      features: [
        { text: t('pricing.starter.feature1'), isCommon: true },
        { text: t('pricing.starter.feature2'), isCommon: true },
        { text: t('pricing.starter.feature3'), isCommon: true },
        { text: t('pricing.starter.feature4'), isCommon: true },
        { text: t('pricing.starter.feature5'), isCommon: true },
        { text: t('pricing.starter.feature6'), isCommon: true },
        { text: t('pricing.starter.feature7'), isCommon: true },
        { text: t('pricing.starter.feature9'), isCommon: true },
        { text: t('pricing.starter.feature10'), isCommon: true },
        { text: t('pricing.starter.feature11'), isCommon: true },
        { text: t('pricing.starter.feature12'), isCommon: true },
        { text: t('pricing.starter.feature13'), isCommon: true },
        { text: t('pricing.starter.feature14'), isCommon: true },
        { text: t('pricing.starter.feature15'), isCommon: true },
        { text: t('pricing.starter.feature16'), isCommon: true },
        { text: t('pricing.builder.feature6'), isCommon: true, isNegative: true },
        { text: t('pricing.builder.feature7'), isCommon: true, isNegative: true },
      ],
    },
    {
      id: 'pro',
      nameKey: 'pricing.pro.name',
      price: '59.90',
      yearlyPrice: '59.90',
      creditsKey: 'pricing.pro.credits',
      descriptionKey: 'pricing.pro.description',
      popular: true,
      hasDiscount: false,
      features: [
        { text: t('pricing.pro.feature1'), isCommon: true },
        { text: t('pricing.pro.feature2'), isCommon: true },
        { text: t('pricing.pro.feature3'), isCommon: true },
        { text: t('pricing.pro.feature4'), isCommon: true },
        { text: t('pricing.pro.feature5'), isCommon: true },
        { text: t('pricing.pro.feature6'), isCommon: true },
        { text: t('pricing.pro.feature7'), isCommon: true },
        { text: t('pricing.pro.feature9'), isCommon: true },
        { text: t('pricing.pro.feature10'), isCommon: true },
        { text: t('pricing.pro.feature11'), isCommon: true },
        { text: t('pricing.pro.feature12'), isCommon: true },
        { text: t('pricing.pro.feature13'), isCommon: true },
        { text: t('pricing.pro.feature14'), isCommon: true },
        { text: t('pricing.pro.feature15'), isCommon: true },
        { text: t('pricing.pro.feature16'), isCommon: true },
        { text: t('pricing.builder.feature6'), isCommon: true, isNegative: true },
        { text: t('pricing.builder.feature7'), isCommon: true, isNegative: true },
      ],
    },
    {
      id: 'builder',
      nameKey: 'pricing.builder.name',
      price: '199',
      yearlyPrice: '159.20',
      creditsKey: 'pricing.builder.credits',
      descriptionKey: 'pricing.builder.description',
      isBuilder: true,
      hasDiscount: true,
      features: [
        { text: t('pricing.builder.feature1'), isCommon: true },
        { text: t('pricing.builder.feature2'), isCommon: true },
        { text: t('pricing.builder.feature3'), isCommon: true },
        { text: t('pricing.builder.feature4'), isCommon: true },
        { text: t('pricing.builder.feature5'), isCommon: true },
        { text: t('pricing.starter.feature6'), isCommon: true },
        { text: t('pricing.starter.feature7'), isCommon: true },
        { text: t('pricing.builder.feature9'), isCommon: true },
        { text: t('pricing.builder.feature10'), isCommon: true },
        { text: t('pricing.builder.feature11'), isCommon: true },
        { text: t('pricing.builder.feature12'), isCommon: true },
        { text: t('pricing.builder.feature13'), isCommon: true },
        { text: t('pricing.builder.feature14'), isCommon: true },
        { text: t('pricing.builder.feature15'), isCommon: true },
        { text: t('pricing.builder.feature16'), isCommon: true },
        { text: t('pricing.builder.feature6'), isCommon: false, isSpecial: true },
        { text: t('pricing.builder.feature7'), isCommon: false, isSpecial: true },
      ],
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData & { general: string }> = {};

    if (mode === 'register' && !formData.name.trim()) {
      newErrors.name = t('auth.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.errors.passwordLength');
    }

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('auth.errors.passwordMismatch');
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = true as unknown as boolean;
      }
      if (!formData.acceptPrivacy) {
        newErrors.acceptPrivacy = true as unknown as boolean;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCouponCode = () => {
    if (!formData.couponCode.trim()) {
      setValidatedCoupon(null);
      setCouponError('');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    setTimeout(() => {
      // Lade Coupons aus localStorage
      const savedCoupons = localStorage.getItem('admin_coupons');
      const coupons = savedCoupons ? JSON.parse(savedCoupons) : [];

      const coupon = coupons.find((c: {
        code: string;
        isActive: boolean;
        usedCount: number;
        maxUses: number;
        expiresAt: string | null;
        category: 'registration' | 'trial';
      }) =>
        c.code.toLowerCase() === formData.couponCode.trim().toLowerCase() &&
        c.isActive &&
        c.usedCount < c.maxUses &&
        (!c.expiresAt || new Date(c.expiresAt) > new Date())
      );

      if (!coupon) {
        setValidatedCoupon(null);
        setCouponError('Ungültiger oder abgelaufener Code');
        setCouponLoading(false);
        return;
      }

      // Prüfe Kategorie: Nur Registrierungs-Gutscheine erlaubt
      if (coupon.category === 'trial') {
        setValidatedCoupon(null);
        setCouponError('Dieser Code ist nur für den Test-Zugang gültig. Bitte auf der Startseite einlösen.');
        setCouponLoading(false);
        return;
      }

      if (coupon.category === 'registration') {
        setValidatedCoupon({
          code: coupon.code,
          plan: coupon.plan,
          duration: coupon.duration || 0,
          durationUnit: coupon.durationUnit || 'days',
          credits: coupon.value || 0,
          isValid: true,
        });
        // Automatisch das Paket auswählen
        setFormData(prev => ({ ...prev, selectedPlan: coupon.plan }));
        setCouponError('');
      } else {
        setValidatedCoupon(null);
        setCouponError('Ungültiger Gutschein-Typ');
      }

      setCouponLoading(false);
    }, 500);
  };

  const removeCoupon = () => {
    setValidatedCoupon(null);
    setFormData(prev => ({ ...prev, couponCode: '', selectedPlan: 'starter' }));
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === 'register') {
        // ── Firebase Register ──────────────────────────
        const planMap: Record<string, string> = { starter: 'Starter', pro: 'Pro', builder: 'Builder' };
        const planName = planMap[formData.selectedPlan] || 'Starter';
        await registerWithEmail(formData.email, formData.password, formData.name, planName);
        // Switch to email verification screen
        setMode('verify');
        setResendTimer(60);
      } else {
        // ── Supabase Login ────────────────────────────
        const user = await loginWithEmail(formData.email, formData.password);
        if (!user?.email_confirmed_at) {
          // User not verified yet — send to verify screen
          setMode('verify');
          setResendTimer(60);
          setIsLoading(false);
          return;
        }
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as { code?: string; message?: string })?.message
        || (err as { code?: string; message?: string })?.code
        || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already been registered')) {
        setErrors({ email: 'Diese E-Mail ist bereits registriert.' });
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('credentials')) {
        setErrors({ general: 'E-Mail oder Passwort falsch.' } as any);
      } else {
        setErrors({ general: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' } as any);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setVerificationError('');

    try {
      // Check latest email verification status from Supabase
      const { supabase } = await import('../../supabase');
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) throw error;

      if (user?.email_confirmed_at) {
        setVerificationSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setVerificationError('E-Mail noch nicht bestätigt. Bitte klick auf den Link in deiner E-Mail.');
      }
    } catch {
      setVerificationError('Fehler beim Prüfen. Bitte erneut versuchen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    try {
      await resendVerificationEmail();
      setResendTimer(60);
      setVerificationError(t('auth.verification.sent'));
      setTimeout(() => setVerificationError(''), 3000);
    } catch {
      setVerificationError('Fehler beim Senden. Bitte versuche es später erneut.');
    }
  };

  const handleVerificationCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...verificationCode];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setVerificationCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      document.getElementById(`code-${nextIndex}`)?.focus();
    } else {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`)?.focus();
      }
    }
    setVerificationError('');
  };

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setErrors({ email: t('auth.errors.emailInvalid') });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await forgotPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch {
      setErrors({ email: 'E-Mail nicht gefunden oder Fehler beim Senden.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (resetPassword.length < 8) {
      setErrors({ password: t('auth.errors.passwordLength') });
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setErrors({ confirmPassword: t('auth.errors.passwordMismatch') });
      return;
    }

    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);
      setResetSuccess(true);
    }, 1500);
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    if (provider === 'apple') return; // Apple not configured yet
    setSocialLoading(provider);
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code || '';
      if (!msg.includes('popup-closed')) {
        setErrors({ general: 'Google-Anmeldung fehlgeschlagen.' } as any);
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Calculate password strength when password changes
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(value.length > 0 ? calculatePasswordStrength(value) : 0);
    }
  };

  // Email Verification View
  const renderVerificationView = () => (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-12 xl:ml-32 my-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#3D3428]/30 to-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-mail-check-line text-[#C9A961] text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('auth.verification.headline')}
        </h2>
        <p className="text-gray-500 mb-2">
          {t('auth.verification.subtitle')}
        </p>
        <p className="text-[#C9A961] font-medium">{formData.email}</p>
      </div>

      {verificationSuccess ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-500 text-3xl"></i>
          </div>
          <p className="text-green-500 font-semibold text-lg mb-2">
            {t('auth.verification.success')}
          </p>
          <p className="text-gray-500 text-sm">{t('auth.loading')}</p>
        </div>
      ) : (
        <form onSubmit={handleVerificationSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
              {t('auth.verification.codeLabel')}
            </label>
            <div className="flex justify-center gap-2">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleVerificationCodeChange(index, e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                  className="w-12 h-14 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-center text-white text-xl font-bold focus:outline-none focus:border-[#C9A961] transition-colors"
                />
              ))}
            </div>
            {verificationError && (
              <p className={`mt-3 text-sm text-center ${verificationError.includes('gesendet') || verificationError.includes('sent') ? 'text-green-500' : 'text-red-500'}`}>
                {verificationError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || verificationCode.join('').length !== 6}
            className="w-full bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-[#C9A961]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                <span>{t('auth.loading')}</span>
              </>
            ) : (
              <>
                <span>{t('auth.verification.submit')}</span>
                <i className="ri-arrow-right-line"></i>
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">
              {t('auth.verification.checkSpam')}
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendTimer > 0}
              className={`text-sm font-medium cursor-pointer ${resendTimer > 0 ? 'text-gray-500' : 'text-[#C9A961] hover:underline'}`}
            >
              {resendTimer > 0
                ? `${t('auth.verification.resendIn')} ${resendTimer} ${t('auth.verification.seconds')}`
                : t('auth.verification.resend')
              }
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setVerificationCode(['', '', '', '', '', '']);
              setVerificationError('');
            }}
            className="w-full text-gray-500 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-1"></i>
            {t('auth.forgot.backToLogin')}
          </button>
        </form>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-[#3D3428]/20 rounded-lg border border-[#3D3428]/30">
        <p className="text-xs text-gray-400 text-center">
          <i className="ri-information-line mr-1"></i>
          E-Mail-Link anklicken, dann hier auf "Weiter" klicken.
        </p>
      </div>
    </div>
  );

  // Forgot Password View
  const renderForgotView = () => (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-12 xl:ml-32 my-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#3D3428]/30 to-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-lock-unlock-line text-[#C9A961] text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('auth.forgot.headline')}
        </h2>
        <p className="text-gray-500">
          {t('auth.forgot.subtitle')}
        </p>
      </div>

      {forgotSuccess ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-mail-send-line text-green-500 text-3xl"></i>
          </div>
          <p className="text-green-500 font-semibold text-lg mb-2">
            {t('auth.forgot.success')}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {t('auth.forgot.successMessage')}
          </p>
          <button
            onClick={() => setMode('reset')}
            className="w-full bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-[#C9A961]/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
          >
            {t('auth.forgot.checkInbox')}
          </button>
          <button
            onClick={() => {
              setMode('login');
              setForgotSuccess(false);
              setForgotEmail('');
            }}
            className="w-full mt-4 text-gray-500 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-1"></i>
            {t('auth.forgot.backToLogin')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleForgotSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.fields.email')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="ri-mail-line text-gray-500"></i>
              </div>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setErrors({});
                }}
                className={`w-full bg-[#1A1F26] border ${errors.email ? 'border-red-500' : 'border-[#3D3428]/30'} rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                placeholder={t('auth.placeholders.email')}
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-[#C9A961]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                <span>{t('auth.loading')}</span>
              </>
            ) : (
              <>
                <span>{t('auth.forgot.submit')}</span>
                <i className="ri-arrow-right-line"></i>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setForgotEmail('');
              setErrors({});
            }}
            className="w-full text-gray-500 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-1"></i>
            {t('auth.forgot.backToLogin')}
          </button>
        </form>
      )}
    </div>
  );

  // Reset Password View
  const renderResetView = () => (
    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-12 xl:ml-32 my-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#3D3428]/30 to-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ri-key-2-line text-[#C9A961] text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('auth.reset.headline')}
        </h2>
        <p className="text-gray-500">
          {t('auth.reset.subtitle')}
        </p>
      </div>

      {resetSuccess ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-double-line text-green-500 text-3xl"></i>
          </div>
          <p className="text-green-500 font-semibold text-lg mb-2">
            {t('auth.reset.success')}
          </p>
          <p className="text-gray-500 text-sm mb-6">
            {t('auth.reset.successMessage')}
          </p>
          <button
            onClick={() => {
              setMode('login');
              setResetSuccess(false);
              setResetPassword('');
              setResetConfirmPassword('');
            }}
            className="w-full bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-[#C9A961]/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
          >
            {t('auth.reset.loginNow')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.reset.newPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="ri-lock-line text-gray-500"></i>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={resetPassword}
                onChange={(e) => {
                  setResetPassword(e.target.value);
                  setErrors({});
                }}
                className={`w-full bg-[#1A1F26] border ${errors.password ? 'border-red-500' : 'border-[#3D3428]/30'} rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                placeholder={t('auth.placeholders.password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              >
                <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500 hover:text-gray-300`}></i>
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.reset.confirmNewPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="ri-lock-check-line text-gray-500"></i>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={resetConfirmPassword}
                onChange={(e) => {
                  setResetConfirmPassword(e.target.value);
                  setErrors({});
                }}
                className={`w-full bg-[#1A1F26] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#3D3428]/30'} rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                placeholder={t('auth.placeholders.confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
              >
                <i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500 hover:text-gray-300`}></i>
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-[#C9A961]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                <span>{t('auth.loading')}</span>
              </>
            ) : (
              <>
                <span>{t('auth.reset.submit')}</span>
                <i className="ri-arrow-right-line"></i>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setResetPassword('');
              setResetConfirmPassword('');
              setErrors({});
            }}
            className="w-full text-gray-500 hover:text-white text-sm transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-1"></i>
            {t('auth.forgot.backToLogin')}
          </button>
        </form>
      )}
    </div>
  );

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    // Normalize to 0-4 scale
    if (strength <= 2) return 1; // Weak
    if (strength <= 3) return 2; // Medium
    if (strength <= 4) return 3; // Strong
    return 4; // Very Strong
  };

  const getPasswordStrengthInfo = () => {
    const strengthLabels = [
      { label: t('auth.passwordStrength.weak'), color: 'bg-red-500', textColor: 'text-red-500' },
      { label: t('auth.passwordStrength.medium'), color: 'bg-yellow-500', textColor: 'text-yellow-500' },
      { label: t('auth.passwordStrength.strong'), color: 'bg-green-500', textColor: 'text-green-500' },
      { label: t('auth.passwordStrength.veryStrong'), color: 'bg-emerald-400', textColor: 'text-emerald-400' },
    ];
    return strengthLabels[passwordStrength - 1] || strengthLabels[0];
  };

  return (
    <div className="min-h-screen bg-[#0F1419] flex">
      {/* Left Side - Branding & Benefits - FIXED POSITION */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2F2A]/50 via-[#0F1419] to-[#0F1419]"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#3D3428] rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#C9A961] rounded-full blur-3xl"></div>
        </div>

        {/* FIXED: Content ist jetzt immer zentriert, unabhängig vom rechten Formular */}
        <div className="relative z-10 w-full h-full flex items-center justify-center lg:justify-end px-12 lg:px-0 lg:pr-12 xl:pr-32">
          <div className="w-full max-w-xl lg:max-w-md xl:max-w-xl">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-3 cursor-pointer group mb-8">
              <div className="relative w-12 h-12 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-xl flex items-center justify-center shadow-lg shadow-[#C9A961]/20 group-hover:shadow-[#C9A961]/40 transition-all duration-300">
                <i className="ri-compass-3-line text-[#0F1419] text-2xl"></i>
                <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center">
                  <i className="ri-star-s-fill text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"></i>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-white">IdeaOracle<span className="text-amber-400">.ai</span></span>
                <p className="text-[10px] text-gray-400 -mt-0.5">Intelligenz & Ideen</p>
              </div>
            </a>

            {/* Main Headline */}
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              {t('auth.branding.headline1')}<br />
              <span className="bg-gradient-to-r from-[#C9A961] via-[#D4B574] to-[#C9A961] bg-clip-text text-transparent">
                {t('auth.branding.headline2')}
              </span>
            </h1>

            <p className="text-gray-400 text-lg mb-12 max-w-md">
              {t('auth.branding.subtitle')}
            </p>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#2D5F4F]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-line text-[#C9A961] text-xl"></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{t('auth.benefits.privacy.title')}</h3>
                  <p className="text-gray-500 text-sm">{t('auth.benefits.privacy.desc')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#2D5F4F]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-brain-line text-[#C9A961] text-xl"></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{t('auth.benefits.honest.title')}</h3>
                  <p className="text-gray-500 text-sm">{t('auth.benefits.honest.desc')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#2D5F4F]/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-rocket-line text-[#C9A961] text-xl"></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{t('auth.benefits.fast.title')}</h3>
                  <p className="text-gray-500 text-sm">{t('auth.benefits.fast.desc')}</p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-[#3D3428]/30">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#C9A961]">10k+</div>
                  <div className="text-xs text-gray-500">{t('auth.trust.users')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#C9A961]">50k+</div>
                  <div className="text-xs text-gray-500">{t('auth.trust.ideas')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#C9A961]">4.9/5</div>
                  <div className="text-xs text-gray-500">{t('auth.trust.rating')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form - INDEPENDENT SCROLLABLE */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen">
        {/* Top Bar - FIXED */}
        <div className="flex justify-between items-center p-6 flex-shrink-0">
          <a href="/" className="lg:hidden flex items-center space-x-2 cursor-pointer">
            <div className="relative w-8 h-8 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center">
              <i className="ri-eye-2-line text-[#0F1419] text-lg"></i>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 flex items-center justify-center">
                <i className="ri-star-s-fill text-amber-400 text-[10px] drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"></i>
              </div>
            </div>
            <span className="text-lg font-bold text-white">NicheFinder</span>
          </a>
          <div className="ml-auto">
            <LanguageSelector />
          </div>
        </div>

        {/* Form Container - SCROLLABLE, INDEPENDENT */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
          {mode === 'verify' ? (
            renderVerificationView()
          ) : mode === 'forgot' ? (
            renderForgotView()
          ) : mode === 'reset' ? (
            renderResetView()
          ) : (
            <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-12 xl:ml-32 my-auto">
              {/* Mode Toggle */}
              <div className="flex bg-[#1A1F26] rounded-xl p-1 mb-8">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${mode === 'login'
                    ? 'bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419]'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {t('auth.login.title')}
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer whitespace-nowrap ${mode === 'register'
                    ? 'bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419]'
                    : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {t('auth.register.title')}
                </button>
              </div>

              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {mode === 'login' ? t('auth.login.headline') : t('auth.register.headline')}
                </h2>
                <p className="text-gray-500">
                  {mode === 'login' ? t('auth.login.subtitle') : t('auth.register.subtitle')}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field (Register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('auth.fields.name')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="ri-user-line text-gray-500"></i>
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full bg-[#1A1F26] border ${errors.name ? 'border-red-500' : 'border-[#3D3428]/30'} rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                        placeholder={t('auth.placeholders.name')}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('auth.fields.email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="ri-mail-line text-gray-500"></i>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full bg-[#1A1F26] border ${errors.email ? 'border-red-500' : 'border-[#3D3428]/30'} rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                      placeholder={t('auth.placeholders.email')}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('auth.fields.password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <i className="ri-lock-line text-gray-500"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full bg-[#1A1F26] border ${errors.password ? 'border-red-500' : 'border-[#3D3428]/30'} rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                      placeholder={t('auth.placeholders.password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                    >
                      <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500 hover:text-gray-300`}></i>
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}

                  {/* Password Strength Indicator */}
                  {mode === 'register' && formData.password.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">{t('auth.passwordStrength.label')}</span>
                        <span className={`text-xs font-medium ${getPasswordStrengthInfo().textColor}`}>
                          {getPasswordStrengthInfo().label}
                        </span>
                      </div>
                      <div className="flex space-x-1.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength
                              ? getPasswordStrengthInfo().color
                              : 'bg-[#3D3428]/30'
                              }`}
                          />
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        <span className={`text-[10px] ${formData.password.length >= 8 ? 'text-green-500' : 'text-gray-500'}`}>
                          <i className={`${formData.password.length >= 8 ? 'ri-check-line' : 'ri-close-line'} mr-0.5`}></i>
                          {t('auth.passwordStrength.minLength')}
                        </span>
                        <span className={`text-[10px] ${/[A-Z]/.test(formData.password) ? 'text-green-500' : 'text-gray-500'}`}>
                          <i className={`${/[A-Z]/.test(formData.password) ? 'ri-check-line' : 'ri-close-line'} mr-0.5`}></i>
                          {t('auth.passwordStrength.uppercase')}
                        </span>
                        <span className={`text-[10px] ${/[0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-500'}`}>
                          <i className={`${/[0-9]/.test(formData.password) ? 'ri-check-line' : 'ri-close-line'} mr-0.5`}></i>
                          {t('auth.passwordStrength.number')}
                        </span>
                        <span className={`text-[10px] ${/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-500' : 'text-gray-500'}`}>
                          <i className={`${/[^a-zA-Z0-9]/.test(formData.password) ? 'ri-check-line' : 'ri-close-line'} mr-0.5`}></i>
                          {t('auth.passwordStrength.special')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password (Register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('auth.fields.confirmPassword')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i className="ri-lock-check-line text-gray-500"></i>
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full bg-[#1A1F26] border ${errors.confirmPassword ? 'border-red-500' : 'border-[#3D3428]/30'} rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                        placeholder={t('auth.placeholders.confirmPassword')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                      >
                        <i className={`${showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-500 hover:text-gray-300`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                )}

                {/* Coupon Code Field (Register only) */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <i className="ri-coupon-3-line mr-1.5 text-[#C9A961]"></i>
                      Gutschein-Code (optional)
                    </label>
                    {validatedCoupon ? (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <i className="ri-check-line text-green-400 text-xl"></i>
                            </div>
                            <div>
                              <p className="text-green-400 font-semibold text-sm">Code eingelöst!</p>
                              <p className="text-gray-400 text-xs">
                                <span className="text-white font-medium">
                                  {validatedCoupon.plan === 'starter' ? 'Starter' : validatedCoupon.plan === 'pro' ? 'Pro' : 'Builder'}
                                </span>
                                {validatedCoupon.duration > 0 && (
                                  <> für {validatedCoupon.duration} {validatedCoupon.durationUnit === 'days' ? (validatedCoupon.duration === 1 ? 'Tag' : 'Tage') : (validatedCoupon.duration === 1 ? 'Monat' : 'Monate')} gratis</>
                                )}
                                {validatedCoupon.credits > 0 && (
                                  <> • {validatedCoupon.credits} Credits</>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                          >
                            <i className="ri-close-line text-gray-400 hover:text-red-400"></i>
                          </button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-green-500/20">
                          <code className="text-green-400 font-mono text-sm bg-green-500/10 px-2 py-1 rounded">
                            {validatedCoupon.code}
                          </code>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i className="ri-coupon-line text-gray-500"></i>
                          </div>
                          <input
                            type="text"
                            value={formData.couponCode}
                            onChange={(e) => {
                              setForgotEmail(e.target.value);
                              setErrors({});
                            }}
                            className={`w-full bg-[#1A1F26] border ${errors.email ? 'border-red-500' : 'border-[#3D3428]/30'} rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A961] transition-colors`}
                            placeholder={t('auth.placeholders.email')}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={validateCouponCode}
                          disabled={!formData.couponCode.trim() || couponLoading}
                          className="px-5 py-3 bg-[#3D3428]/30 hover:bg-[#3D3428]/50 text-[#C9A961] rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center gap-2"
                        >
                          {couponLoading ? (
                            <i className="ri-loader-4-line animate-spin"></i>
                          ) : (
                            <>
                              <i className="ri-check-line"></i>
                              Prüfen
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i>
                        {couponError}
                      </p>
                    )}
                  </div>
                )}

                {/* Plan Selection (Register only) - Disabled when coupon is active */}
                {mode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      {t('auth.fields.selectPlan')}
                      {validatedCoupon && (
                        <span className="ml-2 text-xs text-green-400">
                          (durch Gutschein festgelegt)
                        </span>
                      )}
                    </label>

                    {/* Billing Toggle */}
                    {!validatedCoupon && (
                      <div className="flex items-center justify-center space-x-4 mb-4 p-3 bg-[#1A1F26] rounded-xl border border-[#3D3428]/30">
                        <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
                          {t('pricing.monthly')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsYearly(!isYearly)}
                          className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${isYearly ? 'bg-[#C9A961]' : 'bg-[#3D3428]'
                            }`}
                        >
                          <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'
                              }`}
                          />
                        </button>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
                            {t('pricing.yearly')}
                          </span>
                          <span className="px-2 py-0.5 bg-[#C9A961]/20 text-[#C9A961] text-xs font-bold rounded-full">
                            -20%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {plans.map((plan) => {
                        const displayPrice = isYearly && plan.hasDiscount ? plan.yearlyPrice : plan.price;
                        const showDiscount = isYearly && plan.hasDiscount;

                        return (
                          <div
                            key={plan.id}
                            onClick={() => !validatedCoupon && handleInputChange('selectedPlan', plan.id)}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${validatedCoupon
                              ? plan.id === validatedCoupon.plan
                                ? 'border-green-500 bg-green-500/10 cursor-default'
                                : 'border-[#3D3428]/20 bg-[#1A1F26]/50 opacity-50 cursor-not-allowed'
                              : formData.selectedPlan === plan.id
                                ? plan.isBuilder
                                  ? 'border-amber-500 bg-amber-500/10 cursor-pointer'
                                  : 'border-[#C9A961] bg-[#C9A961]/10 cursor-pointer'
                                : 'border-[#3D3428]/30 bg-[#1A1F26] hover:border-[#3D3428] cursor-pointer'
                              }`}
                          >
                            {plan.popular && !validatedCoupon && !plan.isBuilder && (
                              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-[#C9A961] to-[#A08748] rounded-full text-[10px] font-bold text-[#0F1419]">
                                {t('pricing.mostPopular')}
                              </div>
                            )}
                            {plan.isBuilder && !validatedCoupon && (
                              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                                {showDiscount && <i className="ri-percent-line"></i>}
                                Premium
                              </div>
                            )}
                            {validatedCoupon && plan.id === validatedCoupon.plan && (
                              <div className="absolute -top-2 right-4 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                                <i className="ri-gift-line"></i>
                                GRATIS
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${validatedCoupon
                                  ? plan.id === validatedCoupon.plan
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-gray-600'
                                  : formData.selectedPlan === plan.id
                                    ? plan.isBuilder
                                      ? 'border-amber-500 bg-amber-500'
                                      : 'border-[#C9A961] bg-[#C9A961]'
                                    : 'border-gray-500'
                                  }`}>
                                  {((validatedCoupon && plan.id === validatedCoupon.plan) || (!validatedCoupon && formData.selectedPlan === plan.id)) && (
                                    <i className="ri-check-line text-[#0F1419] text-xs"></i>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-white font-semibold">{t(plan.nameKey)}</span>
                                    {validatedCoupon && plan.id === validatedCoupon.plan ? (
                                      <span className="text-sm text-green-400 line-through decoration-green-400/50">
                                        CHF {plan.price}/mo
                                      </span>
                                    ) : (
                                      <div className="flex items-center space-x-2">
                                        {showDiscount && (
                                          <span className="text-sm text-gray-500 line-through">
                                            CHF {plan.price}
                                          </span>
                                        )}
                                        <span className={`text-sm ${plan.isBuilder ? 'text-amber-400' : 'text-[#C9A961]'}`}>
                                          CHF {displayPrice}/mo
                                        </span>
                                        {showDiscount && (
                                          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold rounded">
                                            -20%
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <p className={`text-xs mt-0.5 ${validatedCoupon && plan.id === validatedCoupon.plan
                                    ? 'text-green-400/80'
                                    : plan.isBuilder ? 'text-amber-400/80' : 'text-gray-500'
                                    }`}>
                                    {t(plan.creditsKey)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            {((validatedCoupon && plan.id === validatedCoupon.plan) || (!validatedCoupon && formData.selectedPlan === plan.id)) && (
                              <div className="mt-3 pt-3 border-t border-[#3D3428]/30">
                                <div className="grid grid-cols-1 gap-1.5">
                                  {plan.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      {feature.isNegative ? (
                                        <i className="ri-close-line text-red-500 text-xs"></i>
                                      ) : feature.isSpecial ? (
                                        <i className="ri-star-fill text-amber-400 text-xs"></i>
                                      ) : (
                                        <i className={`ri-check-line text-xs ${validatedCoupon ? 'text-green-500' : 'text-[#C9A961]'}`}></i>
                                      )}
                                      <span className={`text-xs ${feature.isNegative
                                        ? 'text-red-500 line-through'
                                        : feature.isSpecial
                                          ? 'text-amber-400 font-semibold'
                                          : 'text-gray-400'
                                        }`}>
                                        {feature.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Terms & Privacy (Register only) */}
                {mode === 'register' && (
                  <div className="space-y-3">
                    <label className={`flex items-start space-x-3 cursor-pointer ${errors.acceptTerms ? 'text-red-500' : ''}`}>
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={formData.acceptTerms}
                          onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.acceptTerms
                          ? 'bg-[#C9A961] border-[#C9A961]'
                          : errors.acceptTerms
                            ? 'border-red-500'
                            : 'border-gray-500'
                          }`}>
                          {formData.acceptTerms && (
                            <i className="ri-check-line text-[#0F1419] text-xs"></i>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {t('auth.terms.accept')} <Link to="/legal/terms" className="text-[#C9A961] hover:underline cursor-pointer">{t('auth.terms.terms')}</Link>
                      </span>
                    </label>

                    <label className={`flex items-start space-x-3 cursor-pointer ${errors.acceptPrivacy ? 'text-red-500' : ''}`}>
                      <div className="relative mt-0.5">
                        <input
                          type="checkbox"
                          checked={formData.acceptPrivacy}
                          onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.acceptPrivacy
                          ? 'bg-[#C9A961] border-[#C9A961]'
                          : errors.acceptPrivacy
                            ? 'border-red-500'
                            : 'border-gray-500'
                          }`}>
                          {formData.acceptPrivacy && (
                            <i className="ri-check-line text-[#0F1419] text-xs"></i>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {t('auth.privacy.accept')} <Link to="/legal/privacy" className="text-[#C9A961] hover:underline cursor-pointer">{t('auth.privacy.policy')}</Link>
                      </span>
                    </label>
                  </div>
                )}

                {/* Forgot Password (Login only) */}
                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-sm text-[#C9A961] hover:underline cursor-pointer"
                    >
                      {t('auth.login.forgotPassword')}
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:shadow-[#C9A961]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      <span>{t('auth.loading')}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? t('auth.login.submit') : t('auth.register.submit')}</span>
                      <i className="ri-arrow-right-line"></i>
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#3D3428]/30"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-[#0F1419] text-gray-500">{t('auth.or')}</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleSocialLogin('google')}
                    disabled={socialLoading !== null}
                    className="w-full flex items-center justify-center space-x-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg py-3 text-white hover:bg-[#3D3428]/20 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === 'google' ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                        <span>{t('auth.loading')}</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-google-fill text-xl"></i>
                        <span>{t('auth.social.google')}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleSocialLogin('apple')}
                    disabled={socialLoading !== null}
                    className="w-full flex items-center justify-center space-x-3 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg py-3 text-white hover:bg-[#3D3428]/20 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {socialLoading === 'apple' ? (
                      <>
                        <i className="ri-loader-4-line animate-spin text-xl"></i>
                        <span>{t('auth.loading')}</span>
                      </>
                    ) : (
                      <>
                        <i className="ri-apple-fill text-xl"></i>
                        <span>{t('auth.social.apple')}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Switch Mode */}
                <p className="text-center text-gray-500 mt-8 mb-8">
                  {mode === 'login' ? t('auth.login.noAccount') : t('auth.register.hasAccount')}{' '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-[#C9A961] hover:underline cursor-pointer"
                  >
                    {mode === 'login' ? t('auth.login.signUp') : t('auth.register.signIn')}
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
