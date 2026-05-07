import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const STATS = [
  { key: 'experience', value: 15, suffix: '+' },
  { key: 'clients', value: 25, suffix: '+' },
  { key: 'projects', value: 100, suffix: '+' },
  { key: 'uptime', value: 99.9, suffix: '%' },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const isDecimal = target % 1 !== 0;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-accent-400 text-sm font-semibold uppercase tracking-widest mb-3 block">
              Who we are
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              {t('about.title')}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">{t('about.subtitle')}</p>
            <p className="text-slate-500 leading-relaxed">{t('about.description')}</p>

            {/* Bullet points */}
            <div className="mt-8 space-y-3">
              {[
                'AWS · Azure · GCP multi-cloud expertise',
                'Kubernetes, Helm, Docker & SRE practices',
                'Terraform & CloudFormation — full IaC lifecycle',
                'Python, Java, Groovy · Data & ML pipelines',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-400 flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-6"
          >
            {STATS.map(({ key, value, suffix }) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.03 }}
                className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-center"
              >
                <div className="text-4xl font-extrabold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent mb-2">
                  <Counter target={value} suffix={suffix} />
                </div>
                <p className="text-slate-400 text-sm">{t(`about.stats.${key}`)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
