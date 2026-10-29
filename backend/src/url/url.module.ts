import { Module } from '@nestjs/common';
import { UrlController } from './url.controller.js';
import { UrlService } from './url.service.js';

@Module({
  controllers: [UrlController],
  providers: [UrlService]
})
export class UrlModule {}
