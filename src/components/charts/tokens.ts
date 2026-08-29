/** Chart chrome and series constants shared across chart components. */

/** Axis tick styling, so every chart keeps its chrome recessive. */
export const AXIS_TICK = { fill: 'var(--color-ink-faint)', fontSize: 11 } as const;

export interface Stage {
  key: string;
  label: string;
  value: number;
  /** CSS colour from the validated ordinal ramp (--color-stage-1..4). */
  color: string;
}

/** Task status mapped onto the validated ordinal ramp (see index.css). */
export const TASK_STAGES: Array<Omit<Stage, 'value'>> = [
  { key: 'todo',        label: 'To do',       color: 'var(--color-stage-1)' },
  { key: 'in_progress', label: 'In progress', color: 'var(--color-stage-2)' },
  { key: 'review',      label: 'In review',   color: 'var(--color-stage-3)' },
  { key: 'done',        label: 'Done',        color: 'var(--color-stage-4)' },
];
