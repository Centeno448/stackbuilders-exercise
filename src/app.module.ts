import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PostService } from './post.service';
import { HttpModule } from '@nestjs/axios';
import { WebCrawlerService } from './webcrawler.service';
import { ConfigModule } from '@nestjs/config';

import config from './config';
import { DBService } from './db.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [config],
    }),
  ],
  controllers: [AppController],
  providers: [PostService, WebCrawlerService, DBService],
})
export class AppModule {}
