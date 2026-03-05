
import { useTranslation } from 'react-i18next';

export default function Testimonials() {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart Inc.',
      image: 'https://readdy.ai/api/search-image?query=Professional%20business%20woman%20CEO%20in%20modern%20office%20with%20confident%20smile%20wearing%20elegant%20business%20attire%20against%20minimalist%20white%20background%20corporate%20headshot%20portrait&width=400&height=400&seq=test1&orientation=squarish',
      content: t('testimonials.testimonial1'),
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Product Manager, InnovateCo',
      image: 'https://readdy.ai/api/search-image?query=Professional%20Asian%20business%20man%20product%20manager%20in%20modern%20office%20with%20friendly%20smile%20wearing%20smart%20casual%20attire%20against%20minimalist%20white%20background%20corporate%20headshot%20portrait&width=400&height=400&seq=test2&orientation=squarish',
      content: t('testimonials.testimonial2'),
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Founder, CreativeHub',
      image: 'https://readdy.ai/api/search-image?query=Professional%20Hispanic%20business%20woman%20founder%20entrepreneur%20in%20modern%20office%20with%20warm%20smile%20wearing%20contemporary%20business%20attire%20against%20minimalist%20white%20background%20corporate%20headshot%20portrait&width=400&height=400&seq=test3&orientation=squarish',
      content: t('testimonials.testimonial3'),
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-yellow-400 text-xl"></i>
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="flex items-center">
                <img
                  src={testimonial.image}
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
