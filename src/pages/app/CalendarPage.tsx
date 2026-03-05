import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar as BigCalendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { Plus, X, Calendar, Link2 } from 'lucide-react';
import { mockCalendarEvents } from '@/lib/mock-data';
import type { CalendarEvent } from '@/types';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { en: enUS, es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const SOURCE_COLORS = {
  internal: '#2563eb',
  google: '#dc2626',
  outlook: '#0891b2',
};

export function CalendarPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language?.startsWith('es') ? 'es' : 'en';
  const [events, setEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [calendarToggles, setCalendarToggles] = useState({
    internal: true,
    google: true,
    outlook: true,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  const filtered = events.filter((e) => calendarToggles[e.source]);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;
    const start = new Date(newEventDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setEvents((prev) => [
      ...prev,
      {
        id: `e${Date.now()}`,
        title: newEventTitle,
        start,
        end,
        source: 'internal',
        color: SOURCE_COLORS.internal,
      },
    ]);
    setNewEventTitle('');
    setNewEventDate('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6 flex gap-6 h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 space-y-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> {t('calendar.newEvent')}
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-white text-sm font-semibold mb-3">{t('calendar.connectedCalendars')}</h3>
          <div className="space-y-3">
            {(Object.keys(calendarToggles) as Array<keyof typeof calendarToggles>).map((source) => (
              <label key={source} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={calendarToggles[source]}
                    onChange={() => setCalendarToggles((prev) => ({ ...prev, [source]: !prev[source] }))}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      calendarToggles[source] ? 'opacity-100' : 'opacity-30'
                    }`}
                    style={{ backgroundColor: SOURCE_COLORS[source] }}
                  >
                    {calendarToggles[source] && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-slate-300 text-sm capitalize">
                  {source === 'internal' ? t('calendar.internal') : source.charAt(0).toUpperCase() + source.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <h3 className="text-white text-sm font-semibold mb-2">Integrations</h3>
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs transition-colors">
            <Link2 size={13} className="text-red-400" />
            {t('calendar.connectGoogle')}
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-xs transition-colors">
            <Link2 size={13} className="text-blue-400" />
            {t('calendar.connectOutlook')}
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="rbc-calendar-wrapper h-full">
          <BigCalendar
            localizer={localizer}
            events={filtered}
            view={view}
            date={date}
            onView={(v) => setView(v)}
            onNavigate={(d) => setDate(d)}
            culture={locale}
            style={{ height: '100%' }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: (event as CalendarEvent).color,
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                padding: '2px 6px',
              },
            })}
            messages={{
              today: t('calendar.today'),
              previous: t('calendar.back'),
              next: t('calendar.next'),
              month: t('calendar.month'),
              week: t('calendar.week'),
              day: t('calendar.day'),
              agenda: t('calendar.agenda'),
            }}
          />
        </div>
      </div>

      {/* Add event modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary-400" />
                  <h3 className="text-white font-semibold">{t('calendar.newEvent')}</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">{t('calendar.newEventTitle')}</label>
                  <input
                    required
                    autoFocus
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-primary-500 text-sm"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                    {t('app.cancel')}
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-colors">
                    {t('app.create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
