
import { useState, useEffect } from 'react';

interface AboutData {
  badge: string;
  title: string;
  description: string;
  testimonial: {
    quote: string;
    name: string;
    role: string;
    avatar: string;
  };
}

const defaultAbout: AboutData = {
  badge: 'Our Story',
  title: 'Building the Future of Business Innovation',
  description: 'Founded in 2020, IdeaOne emerged from a simple vision: to empower businesses with tools that make innovation accessible to everyone. Today, we serve over 10,000 companies worldwide, helping them transform their ideas into reality with cutting-edge technology and unparalleled support.',
  testimonial: {
    quote: 'IdeaOne has been instrumental in our digital transformation journey. Their platform is not just a tool, it is a catalyst for innovation.',
    name: 'Alexandra Williams',
    role: 'Chief Innovation Officer',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20executive%20portrait%20headshot%2C%20confident%20corporate%20leader%2C%20clean%20white%20background%2C%20professional%20photography%2C%20natural%20lighting%2C%20warm%20smile%2C%20business%20attire%2C%20high%20quality%20portrait&width=100&height=100&seq=about1&orientation=squarish',
  },
};

export default function About() {
  const [customData, setCustomData] = useState<AboutData | null>(null);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_about');
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
      if (e.key === 'website_about') loadData();
    };
    const handleCustomEvent = () => loadData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  const data = customData || defaultAbout;

  return (
    <section id="about" className="bg-gray-50 py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium">
              {data.badge}
            </div>
            <h2 className="text-5xl font-bold text-gray-900 leading-tight">
              {data.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {data.description}
            </p>
          </div>

          <div className="bg-[#2A2520] rounded-3xl p-10 shadow-xl relative">
            <div className="flex items-center justify-between mb-8">
              <span className="text-white/70 text-sm">Featured Testimonial</span>
              <div className="flex space-x-1">
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                <span className="w-1 h-1 bg-white/50 rounded-full"></span>
              </div>
            </div>

            <blockquote className="text-white text-3xl font-medium leading-relaxed mb-12">
              &ldquo;{data.testimonial.quote}&rdquo;
            </blockquote>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={data.testimonial.avatar}
                  alt={data.testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="text-white font-bold text-base">
                    {data.testimonial.name}
                  </div>
                  <div className="text-white/70 text-sm">
                    {data.testimonial.role}
                  </div>
                </div>
              </div>
              <button className="bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                <i className="ri-arrow-right-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
