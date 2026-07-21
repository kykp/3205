export type JobStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type UrlStatus =
  | 'pending'
  | 'in_progress'
  | 'success'
  | 'error'
  | 'cancelled';

export type UrlResult = {
  url: string;
  status: UrlStatus;
  httpStatus?: number;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
};

export type Job = {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: UrlResult[];
};

export type JobSummary = {
  id: string;
  createdAt: string;
  status: JobStatus;
  total: number;
  successCount: number;
  errorCount: number;
};

export type CreateJobResponse = {
  jobId: string;
};
