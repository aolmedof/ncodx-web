import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, X } from 'lucide-react';
import { mockCalendarEvents, mockProjects } from '@/lib/mock-data';
import type { CalendarEvent } from '@/types';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function CalendarPage() {
  const { t, i18n } = useTranslation();
  const { projectId } = useParams<{ projectId?: string }>();
  const project = mockProjects.find((p) => p.id === projectId);
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(
    projectId ? mockCalendarEvents.filter((e) => !e.projectId || e.projectId === projectId) : mockCalendarEvents
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [form, setForm] = useState({ title: '', description: '', color: '#00FF41' });
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  const isEs = i18n.language === 'es';
  const DAYS = isEs ? DAYS_ES : DAYS_EN;
  const MONTHS = isEs ? MONTHS_ES : MONTHS_EN;

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);
  const today = new Date();

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));

  const eventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.start);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const openNew = (day: number) => {
    setSelectedDate(new Date(year, month, day));
    setForm({ title: '', description: '', color: '#00FF41' });
    setModalOpen(true);
  };

  const addEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;
    const start = new Date(selectedDate);
    start.setHours(10, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(11, 0, 0, 0);
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: form.title,
      description: form.description,
      start, end,
      source: 'internal',
      color: form.color,
      projectId,
    };
    setEvents((prev) => [...prev, newEvent]);
    setModalOpen(false);
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="p-6 bg-signal-bg min-h-full font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="text-signal-text-muted text-xs tracking-widest mb-1">
            {project ? `// ${project.name.toUpperCase()}` : '// GLOBAL'} CALENDAR
          </div>
          <h1 className="text-xl font-bold text-signal-text flex items-center gap-2">
            <CalendarDays size={18} className="text-signal-green" />
            {t('app.calendar', 'Calendario')}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {(['month', 'week'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`text-xs px-3 py-1.5 rounded border transition-colors ${view === v ? 'bg-signal-green text-signal-bg border-signal-green font-bold' : 'border-signal-border text-signal-text-dim hover:border-signal-green hover:text-signal-green'}`}>
                {v === 'month' ? t('calendar.month', 'Mes') : t('calendar.week', 'Semana')}
              </button>
            ))}
          </div>
          <button onClick={() => openNew(today.getDate())}
            className="flex items-center gap-2 px-3 py-1.5 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-xs rounded transition-colors">
            <Plus size={13} /> {t('calendar.newEvent', 'Nuevo Evento')}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={prevMonth} className="p-1.5 text-signal-text-dim hover:text-signal-green border border-signal-border hover:border-signal-green rounded transition-colors">
          <ChevronLeft size={16} />
        </button>
        <h2 className="text-lg font-bold text-signal-text min-w-40 text-center">
          {MONTHS[month]} {year}
        </h2>
        <button onClick={nextMonth} className="p-1.5 text-signal-text-dim hover:text-signal-green border border-signal-border hover:border-signal-green rounded transition-colors">
          <ChevronRight size={16} />
        </button>
        <button onClick={() => setCurrent(new Date())}
          className="text-xs px-3 py-1.5 border border-signal-border text-signal-text-dim hover:border-signal-green hover:text-signal-green rounded transition-colors ml-2">
          {t('calendar.today', 'Hoy')}
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs text-signal-text-muted tracking-wider">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-t border-signal-border">
        {cells.map((day, i) => {
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const dayEvents = day ? eventsForDay(day) : [];
          return (
            <div key={i}
              className={`min-h-[90px] border-r border-b border-signal-border p-1.5 cursor-pointer transition-colors ${day ? 'hover:bg-signal-surface' : 'bg-signal-bg/50'}`}
              onClick={() => day && openNew(day)}>
              {day && (
                <>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${isToday ? 'bg-signal-green text-signal-bg font-bold' : 'text-signal-text-dim'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id}
                        onClick={(e) => { e.stopPropagation(); setDetailEvent(ev); }}
                        className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: ev.color + '25', color: ev.color, borderLeft: `2px solid ${ev.color}` }}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-signal-text-muted pl-1">+{dayEvents.length - 3} {t('calendar.more', 'más')}</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-signal-card border border-signal-border rounded w-full max-w-md mx-4 p-6 shadow-signal-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-signal-text">{t('calendar.newEvent', 'Nuevo Evento')}</h2>
              <button onClick={() => setModalOpen(false)} className="text-signal-text-muted hover:text-signal-text"><X size={16} /></button>
            </div>
            <form onSubmit={addEvent} className="space-y-4">
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('calendar.eventTitle', 'Título')}</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Título del evento"
                  className="w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text text-sm rounded focus:outline-none focus:border-signal-green transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('calendar.description', 'Descripción')}</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 bg-signal-surface border border-signal-border text-signal-text text-sm rounded focus:outline-none focus:border-signal-green transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-xs text-signal-text-dim mb-1.5 uppercase tracking-wider">{t('calendar.color', 'Color')}</label>
                <div className="flex gap-2">
                  {['#00FF41','#3B82F6','#F59E0B','#8B5CF6','#EF4444','#10B981'].map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-signal-card scale-110' : 'opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full px-4 py-2.5 bg-signal-green hover:bg-signal-green-dim text-signal-bg font-bold text-sm rounded transition-colors">
                {t('app.save', 'Guardar')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event detail */}
      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDetailEvent(null)}>
          <div className="bg-signal-card border border-signal-border rounded w-full max-w-sm mx-4 p-5 shadow-signal-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: detailEvent.color }} />
                <h3 className="text-base font-bold text-signal-text">{detailEvent.title}</h3>
              </div>
              <button onClick={() => setDetailEvent(null)} className="text-signal-text-muted hover:text-signal-text"><X size={15} /></button>
            </div>
            <div className="text-xs text-signal-text-dim mb-2">
              {detailEvent.start.toLocaleString(isEs ? 'es-MX' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
            {detailEvent.description && <p className="text-sm text-signal-text-dim">{detailEvent.description}</p>}
            <button onClick={() => { setEvents((prev) => prev.filter((e) => e.id !== detailEvent.id)); setDetailEvent(null); }}
              className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors">
              {t('app.delete', 'Eliminar evento')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
