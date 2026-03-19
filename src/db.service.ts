import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { PostFilter } from './interfaces/post-filter';
import { Request } from './models/request';

@Injectable()
export class DBService implements OnModuleDestroy, OnModuleInit {
  private readonly sequelize: Sequelize;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('dbHost');
    const port = this.configService.get<number>('dbPort');
    const user = this.configService.get<string>('dbUser');
    const pass = this.configService.get<string>('dbPass');
    this.sequelize = new Sequelize({
      database: 'sb-ex-db',
      host,
      port,
      username: user,
      password: pass,
      logging: false,
      dialect: 'postgres',
      models: [Request],
    });
  }

  async onModuleInit() {
    await this.sequelize.sync();
  }

  async onModuleDestroy() {
    await this.sequelize.close();
  }

  async registerRequest(filter?: PostFilter) {
    await Request.create({ filter: filter ?? 'none', time: new Date() });
  }
}
