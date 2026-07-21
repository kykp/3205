import { useEffect } from 'react';
import { getJob } from '../api/jobs';
import { jobsActions } from '../store/jobs.store';

const POLL_INTERVAL_MS = 1500;
const MAX_BACKOFF_MS = 15000;
const REFRESH_LIST_EVERY = 2;

export const usePollingJob = (id: string | null) => {
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    let cancelled = false;
    let timer: number | null | undefined = null;
    let tickCount = 0;
    let errorStreak = 0;

    const tick = async () => {
      try {
        const job = await getJob(id, controller.signal);
        if (cancelled) return;
        errorStreak = 0;
        jobsActions.setActiveDetail(job);
        if (job.status === 'completed' || job.status === 'cancelled') {
          void jobsActions.refreshList();
          return;
        }
        tickCount++;
        if (tickCount % REFRESH_LIST_EVERY === 0) void jobsActions.refreshList();
        timer = setTimeout(tick, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        errorStreak++;
        const delay = Math.min(POLL_INTERVAL_MS * 2 ** (errorStreak - 1), MAX_BACKOFF_MS);
        timer = setTimeout(tick, delay);
      }
    };
    void tick();

    return () => {
      cancelled = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [id]);
};
