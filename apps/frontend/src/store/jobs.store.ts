import { create } from 'zustand';
import type { Job, JobSummary } from '@3205/shared';
import * as api from '../api/jobs';

type State = {
  list: JobSummary[];
  activeId: string | null;
  activeDetail: Job | null;
  submitting: boolean;
  error: string | null;
};

type Actions = {
  refreshList: () => Promise<void>;
  createJob: (urls: string[]) => Promise<void>;
  setActive: (id: string | null) => void;
  setActiveDetail: (job: Job) => void;
  cancelActive: () => Promise<void>;
  clearError: () => void;
};

const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : 'unknown error';

export const useJobsStore = create<State & Actions>((set, get) => ({
  list: [],
  activeId: null,
  activeDetail: null,
  submitting: false,
  error: null,

  refreshList: async () => {
    try {
      const list = await api.listJobs();
      set({ list });
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  createJob: async (urls) => {
    set({ submitting: true, error: null });
    try {
      const { jobId } = await api.createJob(urls);
      set({ activeId: jobId, activeDetail: null, submitting: false });
      await get().refreshList();
    } catch (e) {
      set({ error: errorMessage(e), submitting: false });
    }
  },

  setActive: (id) => {
    if (id === get().activeId) return;
    set({ activeId: id, activeDetail: null });
  },

  setActiveDetail: (job) => {
    if (job.id !== get().activeId) return;
    set({ activeDetail: job });
  },

  cancelActive: async () => {
    const id = get().activeId;
    if (!id) return;
    try {
      await api.cancelJob(id);
      await get().refreshList();
    } catch (e) {
      set({ error: errorMessage(e) });
    }
  },

  clearError: () => set({ error: null }),
}));
