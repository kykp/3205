import type { CreateJobResponse, Job, JobSummary } from '@3205/shared';

const unwrap = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ''}`);
  }
  return res.json() as Promise<T>;
};

export const createJob = (
  urls: string[],
  signal?: AbortSignal,
): Promise<CreateJobResponse> =>
  fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
    signal,
  }).then((res) => unwrap<CreateJobResponse>(res));

export const listJobs = (signal?: AbortSignal): Promise<JobSummary[]> =>
  fetch('/api/jobs', { signal }).then((res) => unwrap<JobSummary[]>(res));

export const getJob = (id: string, signal?: AbortSignal): Promise<Job> =>
  fetch(`/api/jobs/${id}`, { signal }).then((res) => unwrap<Job>(res));

export const cancelJob = async (id: string, signal?: AbortSignal): Promise<void> => {
  const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE', signal });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ''}`);
  }
};
