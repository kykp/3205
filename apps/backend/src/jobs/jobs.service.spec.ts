import { NotFoundException } from '@nestjs/common';
import type { Job } from '@3205/shared';
import { JobWorker } from './job.worker';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let repo: JobsRepository;
  let worker: Pick<JobWorker, 'processJob'>;
  let service: JobsService;

  beforeEach(() => {
    repo = new JobsRepository();
    worker = { processJob: jest.fn().mockResolvedValue(undefined) };
    service = new JobsService(repo, worker as JobWorker);
  });

  it('creates a job with pending urls and kicks off the worker', () => {
    const { jobId } = service.create(['https://a.com', 'https://b.com']);

    const job = repo.findById(jobId);
    expect(job).toBeDefined();
    expect(job!.status).toBe('pending');
    expect(job!.urls.map((u) => u.status)).toEqual(['pending', 'pending']);
    expect(worker.processJob).toHaveBeenCalledWith(jobId);
  });

  it('findOrThrow throws NotFoundException for unknown id', () => {
    expect(() => service.findOrThrow('nope')).toThrow(NotFoundException);
  });

  it('cancel flips in-progress job to cancelled', () => {
    const { jobId } = service.create(['https://a.com']);
    repo.findById(jobId)!.status = 'in_progress';

    service.cancel(jobId);

    expect(repo.findById(jobId)!.status).toBe('cancelled');
  });

  it('cancel does not touch already completed jobs', () => {
    const { jobId } = service.create(['https://a.com']);
    repo.findById(jobId)!.status = 'completed';

    service.cancel(jobId);

    expect(repo.findById(jobId)!.status).toBe('completed');
  });

  it('list returns summaries sorted by createdAt desc', () => {
    const older: Job = {
      id: 'older',
      createdAt: '2020-01-01T00:00:00.000Z',
      status: 'completed',
      urls: [],
    };
    const newer: Job = {
      id: 'newer',
      createdAt: '2025-01-01T00:00:00.000Z',
      status: 'completed',
      urls: [],
    };
    repo.save(older);
    repo.save(newer);

    const summaries = service.list();

    expect(summaries.map((s) => s.id)).toEqual(['newer', 'older']);
  });

  it('findOrThrow computes durationMs from startedAt/finishedAt', () => {
    const { jobId } = service.create(['https://a.com']);
    const job = repo.findById(jobId)!;
    job.urls[0].startedAt = '2025-01-01T00:00:00.000Z';
    job.urls[0].finishedAt = '2025-01-01T00:00:01.500Z';

    const found = service.findOrThrow(jobId);

    expect(found.urls[0].durationMs).toBe(1500);
  });
});
