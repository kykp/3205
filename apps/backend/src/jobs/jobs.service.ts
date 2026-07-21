import { Injectable } from '@nestjs/common';
import { JobsRepository } from './jobs.repository';

@Injectable()
export class JobsService {
  constructor(private readonly repo: JobsRepository) {}
}
