import { Module } from '@nestjs/common';
import { UrlCheckService } from './url-check.service';

@Module({
  providers: [UrlCheckService],
  exports: [UrlCheckService],
})
export class UrlCheckModule {}
