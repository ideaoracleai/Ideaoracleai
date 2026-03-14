
import { useState, useEffect } from 'react';
import { defaultTestimonialsData } from '../../../mocks/websiteDefaults';
import { getWebsiteSettings } from '../../../supabase/database';

interface Testimonial {
  stars: number;
  title: string;
  review: string;
  name: string;
  role: string;
  avatar: string;
}

interface TestimonialsData {
  badge: string;
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

export default function Testimonials() {
  const [customData, setCustomData] = useState<TestimonialsData | null>(null);

  useEffect(() => {
    const loadData = () => {
      const saved = localStorage.getItem('website_testimonials');
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

    getWebsiteSettings('website_testimonials').then(value => {
      if (value && typeof value === 'object') {
        setCustomData(value as TestimonialsData);
        localStorage.setItem('website_testimonials', JSON.stringify(value));
      }
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'website_testimonials') loadData();
    };
    const handleCustomEvent = () => loadData();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('website_data_updated', handleCustomEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('website_data_updated', handleCustomEvent);
    };
  }, []);

  const data = customData || defaultTestimonialsData;
  const testimonials = data.testimonials;

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block bg-[#C9A961]/10 text-[#C9A961] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">{data.badge}</span>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-lg text-gray-600">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-3">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400 text-xl"></i>
                ))}
              </div>
              <h3 className="font-bold text-gray-900 mb-3">{testimonial.title}</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &ldquo;{testimonial.review}&rdquo;
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
