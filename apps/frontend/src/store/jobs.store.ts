import { create } from 'zustand';
import type { Job, JobSummary } from '@3205/shared';
import * as api from '../api/jobs';

type State = {
  list: JobSummary[];
  activeId: string | null;
  activeDetail: Job | null;
  submitting: boolean;
  cancelling: boolean;
  error: string | null;
};

type Actions = {
  refreshList: () => Promise<void>;
  createJob: (urls: string[]) => Promise<boolean>;
  setActive: (id: string | null) => void;
  setActiveDetail: (job: Job) => void;
  cancelActive: () => Promise<void>;
};

const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : 'unknown error';

let refreshEpoch = 0;

const useJobsStore = create<State & Actions>((set, get) => ({
  list: [],
  activeId: null,
  activeDetail: null,
  submitting: false,
  cancelling: false,
  error: null,

  refreshList: async () => {
    const epoch = ++refreshEpoch;
    try {
      const list = await api.listJobs();
      if (epoch !== refreshEpoch) return;
      set({ list, error: null });
    } catch (e) {
      if (epoch !== refreshEpoch) return;
      set({ error: errorMessage(e) });
    }
  },

  createJob: async (urls) => {
    set({ submitting: true, error: null });
    try {
      const { jobId } = await api.createJob(urls);
      set({ activeId: jobId, activeDetail: null, submitting: false });
      await get().refreshList();
      return true;
    } catch (e) {
      set({ error: errorMessage(e), submitting: false });
      return false;
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
    if (!id || get().cancelling) return;
    set({ cancelling: true, error: null });
    try {
      await api.cancelJob(id);
      set({ cancelling: false });
      await get().refreshList();
    } catch (e) {
      set({ error: errorMessage(e), cancelling: false });
    }
  },
}));

export const useJobsList = () => useJobsStore((s) => s.list);
export const useActiveJobId = () => useJobsStore((s) => s.activeId);
export const useActiveJobDetail = () => useJobsStore((s) => s.activeDetail);
export const useJobsSubmitting = () => useJobsStore((s) => s.submitting);
export const useJobsCancelling = () => useJobsStore((s) => s.cancelling);
export const useJobsError = () => useJobsStore((s) => s.error);

export const jobsActions = {
  refreshList: () => useJobsStore.getState().refreshList(),
  createJob: (urls: string[]) => useJobsStore.getState().createJob(urls),
  setActive: (id: string | null) => useJobsStore.getState().setActive(id),
  setActiveDetail: (job: Job) => useJobsStore.getState().setActiveDetail(job),
  cancelActive: () => useJobsStore.getState().cancelActive(),
};
