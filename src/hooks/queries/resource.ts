import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

/** Appends only the params that carry a value, so keys stay stable. */
export function buildPath(base: string, params?: QueryParams): string {
  if (!params) return base;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * Builds the standard list/detail/create/update/delete hook set for one REST
 * resource. Every mutation invalidates the whole resource rather than trying to
 * patch caches by hand — these lists are small and correctness beats cleverness.
 */
export function createResource<T extends { id: string }, TInput = Partial<T>>(
  name: string,
  basePath?: string,
) {
  const path = basePath ?? `/${name}`;

  const keys = {
    all: [name] as const,
    list: (params?: QueryParams) => [name, 'list', params ?? null] as const,
    detail: (id: string | undefined) => [name, 'detail', id] as const,
  };

  function useList(params?: QueryParams, opts?: { enabled?: boolean }) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => api.get<T[]>(buildPath(path, params)),
      enabled: opts?.enabled ?? true,
    });
  }

  function useOne(id: string | undefined) {
    return useQuery({
      queryKey: keys.detail(id),
      queryFn: () => api.get<T>(`${path}/${id}`),
      enabled: Boolean(id),
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (input: TInput) => api.post<T>(path, input),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, ...input }: TInput & { id: string }) =>
        api.put<T>(`${path}/${id}`, input),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useRemove() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => api.delete<void>(`${path}/${id}`),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  }

  return { keys, path, useList, useOne, useCreate, useUpdate, useRemove };
}
