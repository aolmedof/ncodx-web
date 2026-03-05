import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'María García',
    role: 'CTO, FinTech Spain',
    content:
      'NCODX transformed our entire cloud infrastructure in record time. Their expertise in AWS and DevOps practices saved us months of work and reduced our operational costs significantly.',
    avatar: 'MG',
    color: 'bg-primary-600',
  },
  {
    name: 'Carlos Rodríguez',
    role: 'Head of Engineering, LegalTech Madrid',
    content:
      'The AI integration they built for our contract analysis platform is outstanding. What used to take our lawyers hours now takes minutes. Exceptional quality of work.',
    avatar: 'CR',
    color: 'bg-accent-600',
  },
  {
    name: 'Sarah Mitchell',
    role: 'VP Technology, RetailGroup UK',
    content:
      "Their cybersecurity team identified critical vulnerabilities we had no idea about. The zero-trust architecture they implemented gives us peace of mind. Highly professional team.",
    avatar: 'SM',
    color: 'bg-violet-600',
  },
  {
    name: 'Alejandro Torres',
    role: 'CEO, SaaS Startup',
    content:
      "From MVP to production-ready platform in 3 months. NCODX's developers are top-tier. Clean code, great documentation, and they really understand the business context.",
    avatar: 'AT',
    color: 'bg-orange-600',
  },
];

export function Testimonials() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => setCurrent((c) => (c + 1) % TESTIMONIALS.length);

  const testimonial = TESTIMONIALS[current];

  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3 block">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('testimonials.title')}</h2>
          <p className="text-slate-400">{t('testimonials.subtitle')}</p>
        </motion.div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12"
            >
              <Quote size={36} className="text-primary-600/40 mb-6" />
              <p className="text-slate-200 text-lg md:text-xl leading-relaxed mb-8">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold`}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-slate-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary-500 w-6' : 'bg-slate-600 hover:bg-slate-500'}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
