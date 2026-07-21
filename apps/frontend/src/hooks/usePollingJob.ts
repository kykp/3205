import { useEffect } from 'react';
import type { JobStatus } from '@3205/shared';
import { getJob } from '../api/jobs';
import { useJobsStore } from '../store/jobs.store';

const POLL_INTERVAL_MS = 1500;
const TERMINAL: readonly JobStatus[] = ['completed', 'cancelled'];

export const usePollingJob = (id: string | null) => {
  const setActiveDetail = useJobsStore((s) => s.setActiveDetail);
  const refreshList = useJobsStore((s) => s.refreshList);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const tick = async () => {
      try {
        const job = await getJob(id, controller.signal);
        if (stopped) return;
        setActiveDetail(job);
        if (TERMINAL.includes(job.status)) {
          void refreshList();
          return;
        }
        timer = setTimeout(tick, POLL_INTERVAL_MS);
      } catch (err) {
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
  }, [id, setActiveDetail, refreshList]);
};
