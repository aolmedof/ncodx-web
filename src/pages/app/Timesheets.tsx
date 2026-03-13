import { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { ChevronLeft, ChevronRight, Send, CheckCircle } from 'lucide-react';
import { mockProjects, mockTimesheetEntries } from '@/lib/mock-data';
import type { TimesheetEntry } from '@/types';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatWeekRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${weekStart.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}, ${weekStart.getFullYear()}`;
}

type HoursMap = Record<string, Record<string, number>>;

function buildInitialHoursForDates(dates: string[]): HoursMap {
  const map: HoursMap = {};
  for (const p of mockProjects) {
    map[p.id] = {};
    for (const date of dates) {
      const entry = mockTimesheetEntries.find(
        (e: TimesheetEntry) => e.projectId === p.id && e.date === date
      );
      map[p.id][date] = entry ? entry.hours : 0;
    }
  }
  return map;
}

export function Timesheets() {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [toast, setToast] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const [hoursMap, setHoursMap] = useState<HoursMap>(() => buildInitialHoursForDates(weekDates));

  const navigateWeek = (direction: -1 | 1) => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + direction * 7);
    const newDates = getWeekDates(next);
    setWeekStart(next);
    setHoursMap(buildInitialHoursForDates(newDates));
  };

  const goToThisWeek = () => {
    const now = getWeekStart(new Date());
    const newDates = getWeekDates(now);
    setWeekStart(now);
    setHoursMap(buildInitialHoursForDates(newDates));
  };

  const handleHoursChange = (projectId: string, date: string, value: string) => {
    const parsed = parseFloat(value);
    const hours = isNaN(parsed) ? 0 : Math.min(24, Math.max(0, parsed));
    setHoursMap((prev) => ({
      ...prev,
      [projectId]: { ...prev[projectId], [date]: hours },
    }));
  };

  const dayTotals = weekDates.map((date) =>
    mockProjects.reduce((sum, p) => sum + (hoursMap[p.id]?.[date] ?? 0), 0)
  );

  const projectTotals = mockProjects.map((p) =>
    weekDates.reduce((sum, date) => sum + (hoursMap[p.id]?.[date] ?? 0), 0)
  );

  const grandTotal = projectTotals.reduce((a, b) => a + b, 0);

  const pieData = mockProjects
    .map((p, i) => ({ name: p.name, value: projectTotals[i], color: p.color }))
    .filter((d) => d.value > 0);

  const barData = weekDates.map((date, i) => ({
    name: DAY_LABELS[i],
    hours: dayTotals[i],
  }));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const inputCls =
    'w-full text-center bg-signal-bg border border-signal-border rounded px-1 py-1.5 text-signal-text text-sm focus:outline-none focus:border-signal-border-bright transition-colors';

  return (
    <div className="p-6 min-h-screen bg-signal-bg">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-signal-green/20 border border-signal-green text-signal-green px-4 py-3 rounded-xl shadow-signal-card">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-signal-text">Timesheets</h2>
          <p className="text-signal-text-muted text-sm mt-0.5">{formatWeekRange(weekStart)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 bg-signal-surface border border-signal-border rounded-lg text-signal-text-dim hover:text-signal-text hover:border-signal-border-bright transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToThisWeek}
            className="px-3 py-1.5 bg-signal-surface border border-signal-border rounded-lg text-signal-text-dim text-sm hover:text-signal-text hover:border-signal-border-bright transition-colors"
          >
            This Week
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 bg-signal-surface border border-signal-border rounded-lg text-signal-text-dim hover:text-signal-text hover:border-signal-border-bright transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => showToast('Semana enviada para aprobación')}
            className="flex items-center gap-2 ml-2 px-4 py-2 bg-signal-green text-signal-bg rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Send size={14} />
            Submit Week
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-signal-surface border border-signal-border rounded-xl overflow-hidden shadow-signal-card mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-signal-border">
                <th className="text-left px-4 py-3 text-signal-text-muted font-medium w-48">Project</th>
                {weekDates.map((date, i) => (
                  <th key={date} className="text-center px-2 py-3 text-signal-text-muted font-medium min-w-[90px]">
                    <div>{DAY_LABELS[i]}</div>
                    <div className="text-xs text-signal-text-muted font-normal">
                      {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-signal-text-muted font-medium min-w-[70px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {mockProjects.map((project, pi) => (
                <tr
                  key={project.id}
                  className="border-b border-signal-border hover:bg-signal-card/40 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-signal-text text-sm font-medium truncate max-w-[140px]">
                        {project.name}
                      </span>
                    </div>
                  </td>
                  {weekDates.map((date) => {
                    const val = hoursMap[project.id]?.[date] ?? 0;
                    return (
                      <td key={date} className="px-2 py-2">
                        <input
                          type="number"
                          min={0}
                          max={24}
                          step={0.5}
                          value={val}
                          onChange={(e) => handleHoursChange(project.id, date, e.target.value)}
                          className={inputCls}
                          style={val > 0 ? { borderColor: project.color + '80', color: project.color } : {}}
                        />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <span className="text-signal-text font-semibold">{projectTotals[pi].toFixed(1)}</span>
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-signal-card border-t-2 border-signal-border-bright">
                <td className="px-4 py-3 text-signal-text font-semibold">Total</td>
                {dayTotals.map((total, i) => (
                  <td key={i} className="px-2 py-3 text-center">
                    <span className={`font-semibold ${total > 0 ? 'text-signal-green' : 'text-signal-text-muted'}`}>
                      {total.toFixed(1)}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-3 text-center">
                  <span className="text-signal-green font-bold text-base">{grandTotal.toFixed(1)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="bg-signal-surface border border-signal-border rounded-xl p-5 shadow-signal-card">
          <h3 className="text-signal-text font-semibold mb-4">Hours by Project</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a1f2e',
                    border: '1px solid #2a3040',
                    borderRadius: '8px',
                    color: '#c8d0e0',
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)}h`, 'Hours']}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#8a94a8', fontSize: '12px' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 text-signal-text-muted text-sm">
              No hours logged this week
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-signal-surface border border-signal-border rounded-xl p-5 shadow-signal-card">
          <h3 className="text-signal-text font-semibold mb-4">Hours by Day</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#8a94a8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8a94a8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1f2e',
                  border: '1px solid #2a3040',
                  borderRadius: '8px',
                  color: '#c8d0e0',
                }}
                formatter={(value) => [`${Number(value).toFixed(1)}h`, 'Hours']}
              />
              <Bar dataKey="hours" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
