import { Injectable } from '@nestjs/common';
import pLimit from 'p-limit';
import type { UrlResult } from '@3205/shared';
import { UrlCheckService } from '../url-check/url-check.service';
import { JobsRepository } from './jobs.repository';

const CONCURRENCY = 5;
const MAX_DELAY_MS = 10_000;

@Injectable()
export class JobWorker {
  constructor(
    private readonly repo: JobsRepository,
    private readonly urlCheck: UrlCheckService,
  ) {}

  async processJob(jobId: string): Promise<void> {
    const job = this.repo.findById(jobId);
    if (!job || job.status === 'cancelled') return;

    job.status = 'in_progress';

    const limit = pLimit(CONCURRENCY);

    await Promise.all(
      job.urls.map((urlResult) => limit(() => this.processUrl(jobId, urlResult))),
    );

    const finalJob = this.repo.findById(jobId);
    if (finalJob && finalJob.status !== 'cancelled') {
      finalJob.status = 'completed';
    }
  }

  private async processUrl(jobId: string, urlResult: UrlResult): Promise<void> {
    const job = this.repo.findById(jobId);
    if (!job || job.status === 'cancelled') {
      urlResult.status = 'cancelled';
      return;
    }

    urlResult.status = 'in_progress';
    urlResult.startedAt = new Date().toISOString();

    await sleep(Math.random() * MAX_DELAY_MS);

    const result = await this.urlCheck.check(urlResult.url);

    urlResult.finishedAt = new Date().toISOString();

    if (result.httpStatus !== undefined) {
      urlResult.status = 'success';
      urlResult.httpStatus = result.httpStatus;
    } else {
      urlResult.status = 'error';
      urlResult.errorMessage = result.errorMessage;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
