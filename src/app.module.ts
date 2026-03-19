import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { PostService } from './post.service';
import { HttpModule } from '@nestjs/axios';
import { WebCrawlerService } from './webcrawler.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

import config from './config';
import { DBService } from './db.service';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      load: [config],
    }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('cacheTTL'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [PostService, WebCrawlerService, DBService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes(AppController);
  }
}
