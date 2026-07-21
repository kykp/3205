import { useEffect } from 'react';
import type { JobStatus } from '@3205/shared';
import { getJob } from '../api/jobs';
import { jobsActions } from '../store/jobs.store';

const POLL_INTERVAL_MS = 1500;
const TERMINAL: readonly JobStatus[] = ['completed', 'cancelled'];

export const usePollingJob = (id: string | null) => {
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const tick = async () => {
      try {
        const job = await getJob(id, controller.signal);
        if (stopped) return;
        jobsActions.setActiveDetail(job);
        if (TERMINAL.includes(job.status)) {
          void jobsActions.refreshList();
          return;
        }
        timer = setTimeout(tick, POLL_INTERVAL_MS);
      } catch {
        if (controller.signal.aborted || stopped) return;
        timer = setTimeout(tick, POLL_INTERVAL_MS);
      }
    };

    void tick();

    return () => {
      stopped = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [id]);
};
