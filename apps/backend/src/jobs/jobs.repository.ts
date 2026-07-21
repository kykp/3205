import { Injectable } from '@nestjs/common';
import type { Job } from '@3205/shared';

@Injectable()
export class JobsRepository {
  private readonly jobs = new Map<string, Job>();

  save(job: Job): void {
    this.jobs.set(job.id, job);
  }

  findById(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  list(): Job[] {
    return Array.from(this.jobs.values());
  }
}
