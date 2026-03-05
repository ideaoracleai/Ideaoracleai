
import { useState, useEffect } from 'react';
import { defaultTestimonialsData } from '../../../../../mocks/websiteDefaults';

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

export default function TestimonialsEditor() {
  const [data, setData] = useState<TestimonialsData>(defaultTestimonialsData);
  const [editingTestimonial, setEditingTestimonial] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('website_testimonials');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse testimonials data:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('website_testimonials', JSON.stringify(data));
    window.dispatchEvent(new Event('website_data_updated'));
    alert('Testimonials gespeichert!');
  };

  const handleReset = () => {
    setData(defaultTestimonialsData);
    localStorage.removeItem('website_testimonials');
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string | number) => {
    setData(prev => ({
      ...prev,
      testimonials: prev.testimonials.map((t, i) => 
        i === index ? { ...t, [field]: value } : t
      )
    }));
  };

  const addTestimonial = () => {
    setData(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, {
        stars: 5,
        title: 'Neue Bewertung',
        review: 'Bewertungstext hier eingeben...',
        name: 'Name',
        role: 'Position',
        avatar: 'https://readdy.ai/api/search-image?query=professional%20business%20person%20portrait%20headshot%2C%20confident%20professional%2C%20clean%20white%20background%2C%20corporate%20photography%2C%20natural%20lighting%2C%20friendly%20smile%2C%20professional%20attire%2C%20high%20quality%20portrait&width=100&height=100&seq=newavatar&orientation=squarish'
      }]
    }));
    setEditingTestimonial(data.testimonials.length);
  };

  const removeTestimonial = (index: number) => {
    setData(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
    if (editingTestimonial === index) setEditingTestimonial(null);
  };

  const moveTestimonial = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= data.testimonials.length) return;
    const newTestimonials = [...data.testimonials];
    [newTestimonials[index], newTestimonials[newIndex]] = [newTestimonials[newIndex], newTestimonials[index]];
    setData(prev => ({ ...prev, testimonials: newTestimonials }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Testimonials bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">Kundenbewertungen verwalten</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-refresh-line"></i> Zurücksetzen
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-save-line"></i> Speichern
          </button>
        </div>
      </div>

      {/* Bereichs-Überschrift */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <h4 className="text-white font-semibold flex items-center gap-2">
          <i className="ri-heading text-[#C9A961]"></i> Bereichs-Überschrift
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Badge</label>
            <input
              type="text"
              value={data.badge}
              onChange={e => setData(prev => ({ ...prev, badge: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Titel</label>
            <input
              type="text"
              value={data.title}
              onChange={e => setData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Untertitel</label>
            <input
              type="text"
              value={data.subtitle}
              onChange={e => setData(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
            />
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <i className="ri-chat-quote-line text-[#C9A961]"></i> Bewertungen ({data.testimonials.length})
          </h4>
          <button
            onClick={addTestimonial}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            <i className="ri-add-line"></i> Bewertung hinzufügen
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-medium text-sm">{testimonial.name}</p>
                      <p className="text-slate-400 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveTestimonial(index, 'up')}
                      disabled={index === 0}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer disabled:opacity-30"
                    >
                      <i className="ri-arrow-up-s-line text-xs"></i>
                    </button>
                    <button
                      onClick={() => moveTestimonial(index, 'down')}
                      disabled={index === data.testimonials.length - 1}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer disabled:opacity-30"
                    >
                      <i className="ri-arrow-down-s-line text-xs"></i>
                    </button>
                    <button
                      onClick={() => setEditingTestimonial(editingTestimonial === index ? null : index)}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-[#C9A961] hover:bg-[#C9A961]/10 rounded transition-all cursor-pointer"
                    >
                      <i className={`${editingTestimonial === index ? 'ri-arrow-up-s-line' : 'ri-edit-line'} text-xs`}></i>
                    </button>
                    <button
                      onClick={() => removeTestimonial(index)}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`ri-star-fill text-sm ${i < testimonial.stars ? 'text-amber-400' : 'text-slate-600'}`}></i>
                  ))}
                </div>
                <p className="text-white font-medium text-sm mb-1">{testimonial.title}</p>
                <p className="text-slate-400 text-xs line-clamp-2">{testimonial.review}</p>
              </div>

              {editingTestimonial === index && (
                <div className="border-t border-slate-700 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Name</label>
                      <input
                        type="text"
                        value={testimonial.name}
                        onChange={e => updateTestimonial(index, 'name', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Position</label>
                      <input
                        type="text"
                        value={testimonial.role}
                        onChange={e => updateTestimonial(index, 'role', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Bewertungstitel</label>
                    <input
                      type="text"
                      value={testimonial.title}
                      onChange={e => updateTestimonial(index, 'title', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Bewertungstext</label>
                    <textarea
                      value={testimonial.review}
                      onChange={e => updateTestimonial(index, 'review', e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Sterne</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => updateTestimonial(index, 'stars', star)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            testimonial.stars >= star
                              ? 'bg-amber-400 text-[#0F1419]'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          <i className="ri-star-fill text-sm"></i>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Avatar-URL</label>
                    <input
                      type="text"
                      value={testimonial.avatar}
                      onChange={e => updateTestimonial(index, 'avatar', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
