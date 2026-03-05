import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface FaqItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [customFaqs, setCustomFaqs] = useState<FaqItem[] | null>(null);

  // Load any custom FAQ data saved in localStorage
  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_faq');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure the parsed data is an array of objects with the expected shape
          if (Array.isArray(parsed) && parsed.every(item => typeof item.question === 'string' && typeof item.answer === 'string')) {
            setCustomFaqs(parsed);
          } else {
            console.warn('Invalid FAQ data in localStorage – falling back to default FAQs.');
            setCustomFaqs(null);
          }
        } catch (error) {
          console.error('Failed to parse FAQ data from localStorage:', error);
          setCustomFaqs(null);
        }
      } else {
        setCustomFaqs(null);
      }
    };

    loadData();

    // Listen for storage changes (when admin saves data)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website_faq') {
        loadData();
      }
    };

    // Listen for custom event (for same-tab updates)
    const handleCustomEvent = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  // Default FAQ entries – keys are translated via i18next
  const defaultFaqs = [
    { questionKey: 'faq.q1', answerKey: 'faq.a1' },
    { questionKey: 'faq.q2', answerKey: 'faq.a2' },
    { questionKey: 'faq.q3', answerKey: 'faq.a3' },
    { questionKey: 'faq.q4', answerKey: 'faq.a4' },
    { questionKey: 'faq.q5', answerKey: 'faq.a5' },
    { questionKey: 'faq.q6', answerKey: 'faq.a6' },
    { questionKey: 'faq.q7', answerKey: 'faq.a7' },
    { questionKey: 'faq.q8', answerKey: 'faq.a8' },
    { questionKey: 'faq.q9', answerKey: 'faq.a9' },
    { questionKey: 'faq.q10', answerKey: 'faq.a10' },
  ];

  // Build the list of FAQ items to render
  const faqItems = customFaqs
    ? customFaqs.map(f => ({ question: f.question, answer: f.answer }))
    : defaultFaqs.map(f => ({
        question: t(f.questionKey),
        answer: t(f.answerKey),
      }));

  return (
    <section id="faq" className="py-24 px-6 lg:px-8 bg-[#0F1419]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-gray-400">{t('faq.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {faqItems.map((faq, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#1A1F26] to-[#151A20] rounded-2xl border border-[#3D3428]/30 overflow-hidden transition-all duration-300 hover:border-[#C9A961]/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 flex items-center justify-between cursor-pointer text-left"
              >
                <span className="text-xl font-bold text-white pr-4">{faq.question}</span>
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-[#3D3428]/30 rounded-lg">
                  <i
                    className={`ri-arrow-down-s-line text-2xl text-[#C9A961] transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  ></i>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-8 pb-6">
                  <p className="text-gray-400 text-lg leading-relaxed whitespace-pre-line">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
