import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PostService } from './post.service';
import { HttpModule } from '@nestjs/axios';
import { WebCrawlerService } from './webcrawler.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [PostService, WebCrawlerService],
})
export class AppModule {}
