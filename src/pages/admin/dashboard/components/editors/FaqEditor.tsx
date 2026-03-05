import { useState, useEffect } from 'react';
import { defaultFaqData } from '../../../../../mocks/websiteDefaults';

interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  /** Callback that is invoked after a successful save or reset */
  onSave: () => void;
}

/**
 * FAQ editor component – allows adding, editing, re‑ordering and removing
 * FAQ entries. All changes are persisted to localStorage and the parent
 * component is notified via the `onSave` callback.
 */
export default function FaqEditor({ onSave }: Props) {
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqData);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load persisted FAQs on mount
  useEffect(() => {
    const saved = localStorage.getItem('website_faq');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Guard against malformed data (e.g. not an array)
        if (Array.isArray(parsed)) {
          setFaqs(parsed);
        } else {
          console.warn('Invalid FAQ data in localStorage – falling back to defaults.');
        }
      } catch (e) {
        console.error('Failed to parse saved FAQs:', e);
        // If parsing fails we simply keep the default data
      }
    }
  }, []);

  /** Persist current FAQs and notify the parent */
  const handleSave = () => {
    localStorage.setItem('website_faq', JSON.stringify(faqs));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('website_data_updated'));
    alert('FAQ gespeichert!');
  };

  /** Reset to default data and clear persisted storage */
  const handleReset = () => {
    setFaqs(defaultFaqData);
    localStorage.removeItem('website_faq');
    onSave();
  };

  /** Update a single field of a specific FAQ */
  const updateFaq = (index: number, key: keyof FaqItem, value: string) => {
    setFaqs(prev =>
      prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
    );
  };

  /** Append a new FAQ and open it for editing */
  const addFaq = () => {
    const newFaqs = [
      ...faqs,
      { question: 'Neue Frage', answer: 'Antwort hier eingeben...' },
    ];
    setFaqs(newFaqs);
    setEditingIndex(newFaqs.length - 1);
  };

  /** Remove a FAQ by its index */
  const removeFaq = (index: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  /** Move a FAQ up or down in the list */
  const moveFaq = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= faqs.length) return;

    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[newIndex]] = [
      newFaqs[newIndex],
      newFaqs[index],
    ];
    setFaqs(newFaqs);
    setEditingIndex(newIndex);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">FAQ bearbeiten</h3>
          <p className="text-slate-400 text-sm mt-1">
            Fragen und Antworten hinzufügen, bearbeiten oder löschen
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-refresh-line"></i> Zurücksetzen
          </button>
          <button
            onClick={addFaq}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-add-line"></i> Frage hinzufügen
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#C9A961] hover:bg-[#A08748] text-[#0F1419] rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            <i className="ri-save-line"></i> Speichern
          </button>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden transition-all hover:border-slate-600"
          >
            {/* FAQ Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-slate-500 text-xs font-mono w-6 text-center flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {faq.question}
                  </p>
                  <p className="text-slate-400 text-xs truncate mt-0.5">
                    {faq.answer}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                <button
                  onClick={() => moveFaq(index, 'up')}
                  disabled={index === 0}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <i className="ri-arrow-up-s-line text-sm"></i>
                </button>
                <button
                  onClick={() => moveFaq(index, 'down')}
                  disabled={index === faqs.length - 1}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <i className="ri-arrow-down-s-line text-sm"></i>
                </button>
                <button
                  onClick={() =>
                    setEditingIndex(editingIndex === index ? null : index)
                  }
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-[#C9A961] hover:bg-[#C9A961]/10 rounded-md transition-all cursor-pointer"
                >
                  <i
                    className={`${
                      editingIndex === index
                        ? 'ri-arrow-up-s-line'
                        : 'ri-edit-line'
                    } text-sm`}
                  ></i>
                </button>
                <button
                  onClick={() => removeFaq(index)}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>
            </div>

            {/* FAQ Editor */}
            {editingIndex === index && (
              <div className="border-t border-slate-700 p-4 space-y-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">
                    Frage
                  </label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={e => updateFaq(index, 'question', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">
                    Antwort
                  </label>
                  <textarea
                    value={faq.answer}
                    onChange={e => updateFaq(index, 'answer', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C9A961] resize-none"
                  />
                  <p className="text-slate-500 text-xs mt-1 text-right">
                    {faq.answer.length}/500
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {faqs.length === 0 && (
        <div className="bg-slate-800/30 rounded-xl border border-dashed border-slate-600 p-8 text-center">
          <i className="ri-question-answer-line text-4xl text-slate-600 mb-3 block"></i>
          <p className="text-slate-400 text-sm">
            Noch keine FAQ vorhanden. Klicke auf "Frage hinzufügen".
          </p>
        </div>
      )}
    </div>
  );
}
