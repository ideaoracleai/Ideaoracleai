
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

interface HowItWorksData {
  title: string;
  subtitle: string;
  steps: Step[];
}

export default function HowItWorks() {
  const { t } = useTranslation();
  const [customData, setCustomData] = useState<HowItWorksData | null>(null);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_howitworks');
      if (saved) {
        try {
          setCustomData(JSON.parse(saved));
        } catch {
          setCustomData(null);
        }
      } else {
        setCustomData(null);
      }
    };

    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website_howitworks') loadData();
    };
    const handleCustomEvent = () => loadData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  const sectionTitle = customData?.title || t('howItWorks.title');
  const sectionSubtitle = customData?.subtitle || t('howItWorks.subtitle');

  const defaultSteps = [
    { number: '01', title: t('howItWorks.step1Title'), description: t('howItWorks.step1Desc'), icon: 'ri-shopping-bag-3-line' },
    { number: '02', title: t('howItWorks.step2Title'), description: t('howItWorks.step2Desc'), icon: 'ri-question-answer-line' },
    { number: '03', title: t('howItWorks.step3Title'), description: t('howItWorks.step3Desc'), icon: 'ri-shield-check-line' },
    { number: '04', title: t('howItWorks.step4Title'), description: t('howItWorks.step4Desc'), icon: 'ri-checkbox-circle-line' },
  ];

  const steps = customData?.steps || defaultSteps;

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-[#0F1419]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {sectionTitle}
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-gradient-to-br from-[#1A1F26] to-[#151A20] p-8 rounded-2xl border border-[#3D3428]/30 hover:border-[#C9A961]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A961]/10 cursor-pointer group"
            >
              <div className="absolute top-6 right-6 text-6xl font-bold text-[#1A1F26] group-hover:text-[#3D3428]/20 transition-colors duration-300">
                {step.number}
              </div>

              <div className="relative space-y-4">
                <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-[#C9A961] to-[#A08748] rounded-xl">
                  <i className={`${step.icon} text-3xl text-[#0F1419]`}></i>
                </div>

                <h3 className="text-2xl font-bold text-white">
                  {step.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
