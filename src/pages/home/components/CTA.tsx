
import { useState, useEffect } from 'react';

interface CtaData {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
}

const defaultCta: CtaData = {
  title: 'Ready to Transform Your Business?',
  subtitle: 'Join thousands of companies already using IdeaOne to drive innovation and growth',
  buttonText: 'Start Free Trial',
  buttonUrl: '/trial',
};

export default function CTA() {
  const [customData, setCustomData] = useState<CtaData | null>(null);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_cta');
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
      if (e.key === 'website_cta') loadData();
    };
    const handleCustomEvent = () => loadData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  const data = customData || defaultCta;

  return (
    <section id="contact" className="bg-white py-36 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-7xl font-bold text-gray-900 leading-tight mb-6">
          {data.title}
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          {data.subtitle}
        </p>
        <a
          href={data.buttonUrl}
          className="bg-[#5D4E37] text-white px-12 py-5 rounded-full text-lg font-medium hover:bg-[#4D3E27] transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2 cursor-pointer whitespace-nowrap"
        >
          <span>{data.buttonText}</span>
          <i className="ri-arrow-right-line text-xl"></i>
        </a>

        <div className="mt-20 flex items-center justify-center space-x-12 overflow-x-auto pb-4">
          <img
            src="https://readdy.ai/api/search-image?query=modern%20business%20software%20application%20icon%20floating%20on%20transparent%20background%2C%20minimalist%20tech%20product%20design%2C%20clean%20simple%20aesthetic%2C%20professional%20digital%20tool%2C%20contemporary%20style%2C%20high%20quality%20render%2C%20neutral%20tones%2C%20isolated%20object&width=200&height=200&seq=cta1&orientation=squarish"
            alt="Feature 1"
            className="h-32 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
          <img
            src="https://readdy.ai/api/search-image?query=innovative%20digital%20platform%20interface%20preview%20floating%20on%20transparent%20background%2C%20modern%20technology%20product%2C%20clean%20minimalist%20design%2C%20professional%20software%20visualization%2C%20contemporary%20aesthetic%2C%20high%20quality%20render%2C%20neutral%20colors&width=200&height=200&seq=cta2&orientation=squarish"
            alt="Feature 2"
            className="h-32 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
          <img
            src="https://readdy.ai/api/search-image?query=advanced%20business%20analytics%20dashboard%20preview%20floating%20on%20transparent%20background%2C%20modern%20data%20visualization%20tool%2C%20clean%20simple%20design%2C%20professional%20software%20interface%2C%20contemporary%20style%2C%20high%20quality%20render%2C%20neutral%20palette&width=200&height=200&seq=cta3&orientation=squarish"
            alt="Feature 3"
            className="h-32 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
          <img
            src="https://readdy.ai/api/search-image?query=collaborative%20workspace%20tool%20preview%20floating%20on%20transparent%20background%2C%20modern%20team%20software%20design%2C%20clean%20minimalist%20aesthetic%2C%20professional%20digital%20product%2C%20contemporary%20style%2C%20high%20quality%20render%2C%20neutral%20tones&width=200&height=200&seq=cta4&orientation=squarish"
            alt="Feature 4"
            className="h-32 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </section>
  );
}
