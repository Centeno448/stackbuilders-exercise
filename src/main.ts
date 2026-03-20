import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { TracingInterceptor } from './interceptor/tracing.interceptor';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new TracingInterceptor());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  const config = app.get<ConfigService>(ConfigService);

  const port = config.get<number>('appPort') ?? 3000;

  await app.listen(port);

  logger.log(`NestJS server listening on http://localhost:${port}`);
}
void bootstrap();
