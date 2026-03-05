import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Cloud, GitBranch, Code2, Brain, Shield, Lightbulb } from 'lucide-react';

const SERVICES = [
  { key: 'cloud', icon: Cloud, gradient: 'from-blue-500 to-cyan-500' },
  { key: 'devops', icon: GitBranch, gradient: 'from-teal-500 to-emerald-500' },
  { key: 'software', icon: Code2, gradient: 'from-violet-500 to-purple-500' },
  { key: 'ai', icon: Brain, gradient: 'from-orange-500 to-amber-500' },
  { key: 'security', icon: Shield, gradient: 'from-red-500 to-rose-500' },
  { key: 'consulting', icon: Lightbulb, gradient: 'from-primary-500 to-blue-600' },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function Services() {
  const { t } = useTranslation();

  return (
    <section id="services" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary-400 text-sm font-semibold uppercase tracking-widest mb-3 block">
            What we do
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t('services.title')}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{t('services.subtitle')}</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SERVICES.map(({ key, icon: Icon, gradient }) => (
            <motion.div
              key={key}
              variants={item}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:border-slate-600 hover:bg-slate-800 transition-all duration-300 cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {t(`services.${key}.name`)}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t(`services.${key}.desc`)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
