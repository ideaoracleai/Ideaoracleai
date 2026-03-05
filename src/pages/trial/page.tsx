import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { generateDemoResponse, getRatingEmoji, getRatingLabel } from '../../services/demoAI';
import LanguageSelector from '../../components/feature/LanguageSelector';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  rating?: 'good' | 'medium' | 'bad';
}

interface Coupon {
  id: string;
  code: string;
  category: 'trial';
  credits: number;
  duration: number;
  durationUnit: 'days' | 'months';
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

// Language mapping for Speech Recognition
const getRecognitionLanguage = (lang: string): string => {
  const langMap: Record<string, string> = {
    de: 'de-DE',
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
    pt: 'pt-PT',
    ru: 'ru-RU',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    ar: 'ar-SA',
    tr: 'tr-TR',
    hi: 'hi-IN',
    pl: 'pl-PL',
    nl: 'nl-NL',
    sv: 'sv-SE',
    no: 'nb-NO',
    vi: 'vi-VN',
    th: 'th-TH',
    id: 'id-ID',
    sq: 'sq-AL',
  };
  return langMap[lang.split('-')[0]] || 'en-US';
};

export default function TrialPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [credits, setCredits] = useState(100);
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [couponApplied, setCouponApplied] = useState(false);
  const [trialCredits, setTrialCredits] = useState(100);
  const [trialDuration, setTrialDuration] = useState(7);
  const [trialDurationUnit, setTrialDurationUnit] = useState<'days' | 'months'>('days');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load trial settings from admin coupons - get the FIRST active trial coupon
  useEffect(() => {
    const loadDefaultTrialSettings = () => {
      const savedCoupons = localStorage.getItem('admin_trial_coupons');
      if (!savedCoupons) return;

      try {
        const coupons: Coupon[] = JSON.parse(savedCoupons);
        const activeCoupons = coupons
          .filter(c => c.isActive && new Date(c.expiresAt) > new Date())
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        if (activeCoupons.length > 0) {
          const firstCoupon = activeCoupons[0];
          setTrialCredits(firstCoupon.credits);
          setTrialDuration(firstCoupon.duration);
          setTrialDurationUnit(firstCoupon.durationUnit);

          // Update existing trial session with new settings
          const savedTrial = localStorage.getItem('trial_session');
          if (savedTrial) {
            const trial = JSON.parse(savedTrial);
            trial.originalCredits = firstCoupon.credits;
            trial.originalDuration = firstCoupon.duration;
            trial.originalDurationUnit = firstCoupon.durationUnit;

            // If credits are higher than new limit, adjust them
            if (trial.credits > firstCoupon.credits) {
              trial.credits = firstCoupon.credits;
              setCredits(firstCoupon.credits);
            }

            localStorage.setItem('trial_session', JSON.stringify(trial));
          }
        }
      } catch {
        // Ignore errors
      }
    };

    loadDefaultTrialSettings();
  }, []);

  // Validate and apply coupon from URL
  const validateAndApplyCoupon = (code: string): boolean => {
    const savedCoupons = localStorage.getItem('admin_trial_coupons');
    if (!savedCoupons) return false;

    try {
      const coupons: Coupon[] = JSON.parse(savedCoupons);
      const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase());

      if (!coupon) return false;
      if (!coupon.isActive) return false;
      if (new Date(coupon.expiresAt) < new Date()) return false;
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return false;

      // Calculate duration in days
      let durationDays = coupon.duration;
      if (coupon.durationUnit === 'months') {
        durationDays = coupon.duration * 30;
      }

      // Apply coupon
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      const trialSession = {
        credits: coupon.credits,
        expiresAt: expiresAt.toISOString(),
        activatedAt: new Date().toISOString(),
        couponCode: coupon.code,
        duration: durationDays,
        originalCredits: coupon.credits,
        originalDuration: coupon.duration,
        originalDurationUnit: coupon.durationUnit,
      };

      localStorage.setItem('trial_session', JSON.stringify(trialSession));
      setCredits(coupon.credits);
      setDaysRemaining(durationDays);
      setTrialCredits(coupon.credits);
      setTrialDuration(coupon.duration);
      setTrialDurationUnit(coupon.durationUnit);

      // Increase usage count
      const updatedCoupons = coupons.map(c =>
        c.id === coupon.id ? { ...c, usedCount: c.usedCount + 1 } : c
      );
      localStorage.setItem('admin_trial_coupons', JSON.stringify(updatedCoupons));

      return true;
    } catch {
      return false;
    }
  };

  // Load or initialize trial session
  useEffect(() => {
    const couponCode = searchParams.get('code');

    if (couponCode) {
      const applied = validateAndApplyCoupon(couponCode);
      if (applied) {
        setCouponApplied(true);
        return;
      }
    }

    // Get current admin settings first
    const savedCoupons = localStorage.getItem('admin_trial_coupons');
    let defaultCredits = 100;
    let defaultDuration = 7;
    let defaultDurationUnit: 'days' | 'months' = 'days';

    if (savedCoupons) {
      try {
        const coupons: Coupon[] = JSON.parse(savedCoupons);
        const activeCoupons = coupons
          .filter(c => c.isActive && new Date(c.expiresAt) > new Date())
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        if (activeCoupons.length > 0) {
          const firstCoupon = activeCoupons[0];
          defaultCredits = firstCoupon.credits;
          defaultDuration = firstCoupon.duration;
          defaultDurationUnit = firstCoupon.durationUnit;
        }
      } catch {
        // Use defaults
      }
    }

    const savedTrial = localStorage.getItem('trial_session');
    if (savedTrial) {
      const trial = JSON.parse(savedTrial);
      const expiresAt = new Date(trial.expiresAt);
      const now = new Date();

      if (expiresAt > now) {
        // Update trial settings from current admin settings
        trial.originalCredits = defaultCredits;
        trial.originalDuration = defaultDuration;
        trial.originalDurationUnit = defaultDurationUnit;

        // If current credits exceed new limit, cap them
        if (trial.credits > defaultCredits) {
          trial.credits = defaultCredits;
        }

        localStorage.setItem('trial_session', JSON.stringify(trial));

        setCredits(trial.credits);
        const diffTime = expiresAt.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysRemaining(diffDays);

        setTrialCredits(defaultCredits);
        setTrialDuration(defaultDuration);
        setTrialDurationUnit(defaultDurationUnit);

        return;
      } else {
        localStorage.removeItem('trial_session');
      }
    }

    // Create new trial session with current admin settings
    const expiresAt = new Date();
    const durationInDays =
      defaultDurationUnit === 'months' ? defaultDuration * 30 : defaultDuration;
    expiresAt.setDate(expiresAt.getDate() + durationInDays);

    const trialSession = {
      credits: defaultCredits,
      expiresAt: expiresAt.toISOString(),
      activatedAt: new Date().toISOString(),
      originalCredits: defaultCredits,
      originalDuration: defaultDuration,
      originalDurationUnit: defaultDurationUnit,
    };
    localStorage.setItem('trial_session', JSON.stringify(trialSession));
    setCredits(defaultCredits);
    setDaysRemaining(durationInDays);
    setTrialCredits(defaultCredits);
    setTrialDuration(defaultDuration);
    setTrialDurationUnit(defaultDurationUnit);
  }, [searchParams]);

  // Check for Speech Recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Initialize Speech Recognition
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = getRecognitionLanguage(i18n.language);
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInputValue(prev => (prev ? `${prev} ` : '') + finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = async () => {
    if (isListening) {
      stopListening();
    }

    if (!inputValue.trim() || isTyping || credits <= 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const userInput = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, userMessage]);

    const newCredits = credits - 15;
    setCredits(newCredits);

    const savedTrial = localStorage.getItem('trial_session');
    if (savedTrial) {
      const trial = JSON.parse(savedTrial);
      trial.credits = newCredits;
      localStorage.setItem('trial_session', JSON.stringify(trial));
    }

    setIsTyping(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const aiResponse = await generateDemoResponse(userInput, conversationHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        rating: aiResponse.rating,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('chat.errorAiFailed'),
        timestamp: new Date(),
        rating: 'bad',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpgrade = () => {
    navigate('/auth?mode=register');
  };

  // Format duration text
  const getDurationText = () => {
    if (trialDurationUnit === 'months') {
      return trialDuration === 1
        ? t('trial.info.duration.oneMonth', '1 Monat')
        : t('trial.info.duration.months', '{{count}} Monate', { count: trialDuration });
    }
    return trialDuration === 1
      ? t('trial.info.duration.oneDay', '1 Tag')
      : t('trial.info.duration.days', '{{count}} Tage', { count: trialDuration });
  };

  // Format banner title with dynamic duration
  const getBannerTitle = () => {
    if (couponApplied) {
      return t('trial.banner.couponApplied', 'Gutschein aktiviert!');
    }

    if (trialDurationUnit === 'months') {
      const monthText = trialDuration === 1
        ? t('trial.banner.oneMonth', '1-Monats')
        : t('trial.banner.months', '{{count}}-Monats', { count: trialDuration });
      return `${monthText}-Testversion aktiv`;
    }

    const dayText = trialDuration === 1
      ? t('trial.banner.oneDay', '1-Tages')
      : t('trial.banner.days', '{{count}}-Tage', { count: trialDuration });
    return `${dayText}-Testversion aktiv`;
  };

  return (
    <div className="min-h-screen bg-[#0F1419] flex flex-col">
      {/* Header */}
      <header className="bg-[#1A1F26] border-b border-[#3D3428]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3 cursor-pointer">
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center shadow-lg shadow-[#C9A961]/20">
                <i className="ri-eye-2-line text-[#0F1419] text-xl"></i>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 flex items-center justify-center">
                  <i className="ri-star-s-fill text-amber-400 text-xs drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]"></i>
                </div>
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">AI Assistant</h1>
                <p className="text-xs text-gray-400">{t('trial.subtitle', 'Kostenlose Testversion')}</p>
              </div>
            </a>
            <div className="flex items-center gap-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Trial Banner */}
      <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-orange-400"></i>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {getBannerTitle()}
                </p>
                <p className="text-xs text-gray-400">
                  {t('trial.banner.remaining', 'Noch {{days}} Tage übrig', { days: daysRemaining })} • {credits}{' '}
                  {t('trial.banner.credits', 'Credits verfügbar')}
                </p>
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-sm flex items-center gap-2"
            >
              <i className="ri-vip-crown-line"></i>
              {t('trial.banner.upgradeNow', 'Jetzt upgraden')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="max-w-2xl w-full text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-2xl flex items-center justify-center shadow-lg shadow-[#C9A961]/20 group-hover:shadow-[#C9A961]/40 transition-all duration-300">
                  <i className="ri-compass-3-line text-[#0F1419] text-2xl"></i>
                  <div className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center">
                    <i className="ri-star-s-fill text-amber-400 text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"></i>
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold text-white">
                    IdeaOracle<span className="text-amber-400">.ai</span>
                  </span>
                  <p className="text-[10px] text-gray-400 -mt-0.5">Intelligenz & Ideen</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setInputValue(t('chat.suggestion1'))}
                    className="p-4 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <i className="ri-search-line text-[#C9A961] text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {t('chat.suggestion1')}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputValue(t('chat.suggestion2'))}
                    className="p-4 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <i className="ri-lightbulb-line text-[#C9A961] text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {t('chat.suggestion2')}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputValue(t('chat.suggestion3'))}
                    className="p-4 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <i className="ri-line-chart-line text-[#C9A961] text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {t('chat.suggestion3')}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setInputValue(t('chat.suggestion4'))}
                    className="p-4 bg-[#1A1F26] border border-[#3D3428]/30 rounded-lg text-left hover:border-[#C9A961]/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-3">
                      <i className="ri-focus-3-line text-[#C9A961] text-xl mt-0.5"></i>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {t('chat.suggestion4')}
                      </span>
                    </div>
                  </button>
                </div>

                <div className="mt-8 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <i className="ri-information-line text-orange-400 text-xl mt-0.5"></i>
                    <div className="text-left">
                      <p className="text-sm text-white font-semibold mb-1">
                        {t('trial.info.title', 'Testversion-Einschränkungen')}
                      </p>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>
                          • {trialCredits} {t('trial.info.creditsFor', 'Credits für')}{' '}
                          {getDurationText()}
                        </li>
                        <li>• {t('trial.info.noHistory', 'Keine Gesprächshistorie')}</li>
                        <li>• {t('trial.info.noSettings', 'Eingeschränkte Funktionen')}</li>
                        <li>• {t('trial.info.upgrade', 'Upgrade für volle Features')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-sparkling-2-fill text-[#0F1419]"></i>
                    </div>
                  )}
                  <div
                    className={`max-w-3xl ${
                      message.role === 'user'
                        ? 'bg-[#C9A961] text-[#0F1419] rounded-2xl rounded-tr-sm'
                        : 'bg-[#1A1F26] text-white rounded-2xl rounded-tl-sm'
                    } px-5 py-4`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                    {message.role === 'assistant' && message.rating && (
                      <div className="mt-3 pt-3 border-t border-[#3D3428]/30 flex items-center gap-2">
                        <span className="text-lg">{getRatingEmoji(message.rating)}</span>
                        <span className="text-xs font-semibold text-gray-400">{getRatingLabel(message.rating)}</span>
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-[#3D3428] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-user-3-fill text-white"></i>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-sparkling-2-fill text-[#0F1419]"></i>
                  </div>
                  <div className="max-w-3xl bg-[#1A1F26] text-white rounded-2xl rounded-tl-sm px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-xs text-gray-400 ml-2">
                        {i18n.language.startsWith('de')
                          ? 'KI schreibt...'
                          : i18n.language.startsWith('en')
                          ? 'AI is typing...'
                          : i18n.language.startsWith('es')
                          ? 'IA está escribiendo...'
                          : i18n.language.startsWith('fr')
                          ? 'IA écrit...'
                          : i18n.language.startsWith('ru')
                          ? 'ИИ пишет...'
                          : i18n.language.startsWith('zh')
                          ? 'AI 正在输入...'
                          : i18n.language.startsWith('ja')
                          ? 'AIが入力中...'
                          : i18n.language.startsWith('ko')
                          ? 'AI가 입력 중...'
                          : i18n.language.startsWith('ar')
                          ? 'الذكاء الاصطناعي يكتب...'
                          : i18n.language.startsWith('tr')
                          ? 'AI yazıyor...'
                          : 'AI is typing...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Credits Warning */}
        {credits <= 30 && credits > 0 && (
          <div className="mx-4 mb-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="ri-alert-line text-orange-400"></i>
              <span className="text-sm text-orange-400">Nur noch {credits} Credits übrig!</span>
            </div>
            <button
              onClick={handleUpgrade}
              className="text-xs text-orange-400 hover:text-orange-300 font-medium cursor-pointer whitespace-nowrap"
            >
              Jetzt upgraden →
            </button>
          </div>
        )}

        {/* No Credits Warning */}
        {credits <= 0 && (
          <div className="mx-4 mb-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <i className="ri-error-warning-line text-red-400 text-xl"></i>
                </div>
                <div>
                  <p className="text-red-400 font-semibold">Credits aufgebraucht</p>
                  <p className="text-xs text-gray-400">Upgrade für unbegrenzte Nutzung</p>
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap text-sm"
              >
                Jetzt upgraden
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-[#3D3428]/30 p-4 bg-[#1A1F26]">
          <div className="max-w-4xl mx-auto">
            <div className={`bg-[#0F1419] border ${credits <= 0 ? 'border-red-500/30' : 'border-[#3D3428]/30'} rounded-xl p-3 focus-within:border-[#C9A961]/30 transition-colors`}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  credits <= 0
                    ? 'Keine Credits mehr verfügbar...'
                    : isListening
                    ? t('chat.listeningPlaceholder', 'Ich höre zu... Sprechen Sie jetzt.')
                    : t('chat.inputPlaceholder')
                }
                rows={1}
                disabled={isTyping || credits <= 0}
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm max-h-32 overflow-y-auto disabled:opacity-50"
                style={{ minHeight: '24px' }}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3D3428]/30">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startListening}
                    disabled={!speechSupported || isTyping || credits <= 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white hover:bg-[#1A1F26]'
                    }`}
                    title={isListening ? t('chat.stopListening', 'Aufnahme stoppen') : t('chat.voice', 'Sprechen')}
                  >
                    <i className={isListening ? 'ri-stop-fill text-lg' : 'ri-mic-line text-lg'}></i>
                  </button>
                  {isListening && (
                    <span className="text-xs text-red-400 animate-pulse">{t('chat.recording', 'Aufnahme läuft...')}</span>
                  )}
                  <div className={`flex items-center gap-2 text-xs ml-2 ${credits <= 30 ? 'text-orange-400' : 'text-gray-400'}`}>
                    <i className="ri-coins-line text-orange-400"></i>
                    <span>{credits} {t('trial.creditsRemaining', 'Credits übrig')}</span>
                  </div>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || credits <= 0}
                  className="px-4 py-2 bg-gradient-to-r from-[#C9A961] to-[#A08748] text-[#0F1419] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#C9A961]/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>{t('chat.send')}</span>
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">{t('trial.inputHint', 'Testversion - Keine Gesprächshistorie verfügbar')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
