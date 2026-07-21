import { Module } from '@nestjs/common';
import { UrlCheckModule } from '../url-check/url-check.module';
import { JobsController } from './jobs.controller';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';
import { JobWorker } from './job.worker';

@Module({
  imports: [UrlCheckModule],
  controllers: [JobsController],
  providers: [JobsService, JobsRepository, JobWorker],
})
export class JobsModule {}
