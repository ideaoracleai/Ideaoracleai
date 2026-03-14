
import { useState, useEffect } from 'react';
import { defaultFeaturesData } from '../../../mocks/websiteDefaults';
import { getWebsiteSettings } from '../../../supabase/database';

interface Feature {
  title: string;
  description: string;
  icon: string;
  bgColor: string;
}

interface FeaturesData {
  title1: string;
  title2: string;
  title3: string;
  mainFeature: {
    title: string;
    description: string;
    image: string;
  };
  features: Feature[];
}

export default function Features() {
  const [customData, setCustomData] = useState<FeaturesData | null>(null);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_features');
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

    getWebsiteSettings('website_features').then(value => {
      if (value && typeof value === 'object') {
        setCustomData(value as FeaturesData);
        localStorage.setItem('website_features', JSON.stringify(value));
      }
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website_features') loadData();
    };
    const handleCustomEvent = () => loadData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  const data = customData || defaultFeaturesData;

  return (
    <section id="features" className="py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {data.title1}{' '}
            <span className="text-[#C9A961]">{data.title2}</span>{' '}
            {data.title3}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">{data.mainFeature.title}</h3>
            <p className="text-lg text-gray-600 leading-relaxed">{data.mainFeature.description}</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src={data.mainFeature.image}
              alt={data.mainFeature.title}
              className="w-full h-64 object-cover"
            />
          </div>
        </div>

        {data.features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: feature.bgColor + '33' }}
                >
                  <i className={`${feature.icon} text-2xl`} style={{ color: feature.bgColor }}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
