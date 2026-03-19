import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PostService } from './post.service';
import { HttpModule } from '@nestjs/axios';
import { WebCrawlerService } from './webcrawler.service';
import { ConfigModule } from '@nestjs/config';

import config from './config';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [config],
    }),
  ],
  controllers: [AppController],
  providers: [PostService, WebCrawlerService],
})
export class AppModule {}
