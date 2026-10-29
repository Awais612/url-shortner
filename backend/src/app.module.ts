import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UrlModule } from './url/url.module.js';

@Module({
  imports: [PrismaModule, UrlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
