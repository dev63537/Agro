/**
 * Agro Billing — React Query hooks for Farmers.
 * #18 Optimistic UI Updates
 *
 * Mutations immediately update the cached farmers list
 * before the server responds. If the server returns an
 * error the cache is rolled back automatically.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/apiClient';
import { showSuccess, showError } from '../lib/toast';

const QUERY_KEY = ['farmers'];

// ── Read ─────────────────────────────────────────────────────
export function useFarmers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn:  () => api.get('/farmers').then((r) => r.data.farmers || []),
    staleTime: 60_000,
  });
}

export function useFarmer(id) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn:  () => api.get(`/farmers/${id}`).then((r) => r.data.farmer),
    enabled:  !!id,
  });
}

// ── Create (optimistic) ──────────────────────────────────────
export function useCreateFarmer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/farmers', data).then((r) => r.data.farmer),
    onMutate: async (newData) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old = []) => [
        { ...newData, _id: `temp-${Date.now()}`, farmerCode: '…', pendingDues: 0 },
        ...old,
      ]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
      showError('Failed to add farmer.');
    },
    onSuccess: (farmer) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showSuccess(`Farmer ${farmer.name} added!`);
    },
  });
}

// ── Update (optimistic) ──────────────────────────────────────
export function useUpdateFarmer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.patch(`/farmers/${id}`, data).then((r) => r.data.farmer),
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData(QUERY_KEY);
      qc.setQueryData(QUERY_KEY, (old = []) =>
        old.map((f) => (f._id === id ? { ...f, ...data } : f))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
      showError('Failed to update farmer.');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showSuccess('Farmer updated!');
    },
  });
}

// ── Soft Delete (optimistic) ─────────────────────────────────
export function useDeleteFarmer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/farmers/${id}`).then((r) => r.data),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const prev = qc.getQueryData(QUERY_KEY);
      // Instantly remove from list
      qc.setQueryData(QUERY_KEY, (old = []) => old.filter((f) => f._id !== id));
      return { prev };
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(QUERY_KEY, ctx.prev);
      showError(err?.response?.data?.error || 'Failed to delete farmer.');
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showSuccess(data.message || 'Farmer removed.');
    },
  });
}

// ── Send Reminder ────────────────────────────────────────────
export function useSendReminder() {
  return useMutation({
    mutationFn: (id) => api.post(`/farmers/${id}/remind`).then((r) => r.data),
    onSuccess:  (data) => showSuccess(data.message || 'Reminder sent!'),
    onError:    ()     => showError('Failed to send reminder.'),
  });
}
