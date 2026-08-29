import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { createResource, type QueryParams } from './resource';
import type {
  AiConversation, Contract, DashboardOverview, Goal, Integration, Invoice, Note,
  Project, Secret, Task, TimesheetEntry, TimesheetSummary, User,
} from '@/types';

/* ── Plain CRUD resources ────────────────────────────────────────────────── */
export const projectsResource   = createResource<Project>('projects');
export const tasksResource      = createResource<Task>('tasks');
export const contractsResource  = createResource<Contract>('contracts');
export const invoicesResource   = createResource<Invoice>('invoices');
export const timesheetsResource = createResource<TimesheetEntry>('timesheets');
export const notesResource      = createResource<Note>('notes');
export const secretsResource    = createResource<Secret>('secrets');
export const goalsResource      = createResource<Goal>('goals');
export const integrationsResource = createResource<Integration>('integrations');

export const useProjects   = projectsResource.useList;
export const useProject    = projectsResource.useOne;
export const useTasks      = tasksResource.useList;
export const useContracts  = contractsResource.useList;
export const useInvoices   = invoicesResource.useList;
export const useInvoice    = invoicesResource.useOne;
export const useTimesheets = timesheetsResource.useList;
export const useNotes      = notesResource.useList;
export const useSecrets    = secretsResource.useList;
export const useGoals      = goalsResource.useList;
export const useIntegrations = integrationsResource.useList;

/* ── Project lookup ──────────────────────────────────────────────────────────
   The API never denormalises a project's name or colour onto tasks, timesheets
   or invoices, so the UI joins them here instead of inventing wire fields.    */
export function useProjectMap() {
  const { data: projects = [], ...rest } = useProjects();
  const map = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  return { projects, map, ...rest };
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.get<DashboardOverview>('/dashboard/overview'),
  });
}

/* ── Timesheets summary ──────────────────────────────────────────────────── */
export function useTimesheetSummary(params?: QueryParams) {
  return useQuery({
    queryKey: ['timesheets', 'summary', params ?? null],
    queryFn: () => {
      const search = new URLSearchParams();
      for (const [k, v] of Object.entries(params ?? {})) {
        if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
      }
      const qs = search.toString();
      return api.get<TimesheetSummary>(`/timesheets/summary${qs ? `?${qs}` : ''}`);
    },
  });
}

/* ── Calendar ────────────────────────────────────────────────────────────── */
export const calendarResource = createResource<import('@/types').CalendarEvent>(
  'calendar-events',
  '/calendar/events',
);
export const useCalendarEvents = calendarResource.useList;

/* ── Invoice lifecycle actions ───────────────────────────────────────────── */
export function useInvoiceAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'send' | 'mark-paid' }) =>
      api.post<Invoice>(`/invoices/${id}/${action}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

/* ── AI chat ─────────────────────────────────────────────────────────────── */
export function useConversations() {
  return useQuery({
    queryKey: ['ai', 'conversations'],
    queryFn: () => api.get<AiConversation[]>('/ai/conversations'),
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      api.post<unknown>(`/ai/conversations/${id}/messages`, { content }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai'] }),
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => api.post<AiConversation>('/ai/conversations', { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai'] }),
  });
}

/* ── Current user ────────────────────────────────────────────────────────── */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<User>('/me'),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Record<string, unknown>) => api.put<User>('/me', patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

export { type QueryParams } from './resource';
