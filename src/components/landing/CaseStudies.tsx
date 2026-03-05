import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';

const CASE_COLORS = ['from-primary-600 to-accent-600', 'from-violet-600 to-pink-600', 'from-orange-600 to-red-600'];
const CASE_PATTERNS = [
  'radial-gradient(circle at 20% 50%, rgba(37,99,235,0.4) 0%, transparent 60%)',
  'radial-gradient(circle at 80% 20%, rgba(124,58,237,0.4) 0%, transparent 60%)',
  'radial-gradient(circle at 50% 80%, rgba(234,88,12,0.4) 0%, transparent 60%)',
];

export function CaseStudies() {
  const { t } = useTranslation();
  const cases = ['c1', 'c2', 'c3'];

  return (
    <section id="portfolio" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent-400 text-sm font-semibold uppercase tracking-widest mb-3 block">
            Our Work
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t('caseStudies.title')}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{t('caseStudies.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cases.map((key, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              className="group relative overflow-hidden rounded-2xl border border-slate-800 hover:border-slate-600 transition-all duration-300 cursor-default"
            >
              {/* Visual card top */}
              <div
                className={`h-48 bg-gradient-to-br ${CASE_COLORS[i]} relative overflow-hidden`}
                style={{ background: CASE_PATTERNS[i] }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${CASE_COLORS[i]} opacity-70`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{i + 1}</span>
                  </div>
                </div>
                {/* Tag */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-white text-xs font-medium border border-white/20">
                  {t(`caseStudies.cases.${key}.tag`)}
                </div>
                {/* Hover arrow */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 bg-slate-900">
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-primary-300 transition-colors">
                  {t(`caseStudies.cases.${key}.title`)}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t(`caseStudies.cases.${key}.desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
