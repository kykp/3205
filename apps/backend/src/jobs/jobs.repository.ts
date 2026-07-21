import { Injectable } from '@nestjs/common';
import type { Job } from '@3205/shared';

@Injectable()
export class JobsRepository {
  private readonly jobs = new Map<string, Job>();
}
