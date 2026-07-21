import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import type { Job, JobSummary } from '@3205/shared';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.jobs.create(dto.urls);
  }

  @Get()
  list(): JobSummary[] {
    return this.jobs.list();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Job {
    return this.jobs.findOrThrow(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  cancel(@Param('id') id: string): void {
    this.jobs.cancel(id);
  }
}
