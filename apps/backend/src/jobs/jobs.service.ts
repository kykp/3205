import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { CreateJobResponse, Job, JobSummary, UrlResult } from '@3205/shared';
import { JobWorker } from './job.worker';
import { JobsRepository } from './jobs.repository';

@Injectable()
export class JobsService {
  constructor(
    private readonly repo: JobsRepository,
    private readonly worker: JobWorker,
  ) {}

  create(urls: string[]): CreateJobResponse {
    const urlResults: UrlResult[] = urls.map((url) => ({
      url,
      status: 'pending',
    }));

    const job: Job = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      urls: urlResults,
    };

    this.repo.save(job);
    void this.worker.processJob(job.id);

    return { jobId: job.id };
  }

  list(): JobSummary[] {
    return this.repo.list().map((job) => this.toSummary(job));
  }

  findOrThrow(id: string): Job {
    const job = this.repo.findById(id);
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    return {
      ...job,
      urls: job.urls.map((u) => this.withDuration(u)),
    };
  }

  cancel(id: string): void {
    const job = this.repo.findById(id);
    if (!job) {
      throw new NotFoundException(`Job ${id} not found`);
    }
    if (job.status === 'pending' || job.status === 'in_progress') {
      job.status = 'cancelled';
    }
  }

  private toSummary(job: Job): JobSummary {
    let successCount = 0;
    let errorCount = 0;
    for (const u of job.urls) {
      if (u.status === 'success') successCount++;
      else if (u.status === 'error') errorCount++;
    }
    return {
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      total: job.urls.length,
      successCount,
      errorCount,
    };
  }

  private withDuration(u: UrlResult): UrlResult {
    if (u.startedAt && u.finishedAt) {
      const durationMs = new Date(u.finishedAt).getTime() - new Date(u.startedAt).getTime();
      return { ...u, durationMs };
    }
    return u;
  }
}
