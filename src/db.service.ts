import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { PostFilter } from './interfaces/post-filter';
import { Request } from './models/request';
import { UUID } from 'crypto';
import { QueryTypes } from 'sequelize';

@Injectable()
export class DBService implements OnModuleDestroy, OnModuleInit {
  private sequelize: Sequelize;
  private readonly logger = new Logger(DBService.name);

  constructor(private readonly configService: ConfigService) {}

  private async prepareDatabase(config: ConfigService) {
    const host = config.get<string>('dbHost');
    const port = config.get<number>('dbPort');
    const user = config.get<string>('dbUser');
    const pass = config.get<string>('dbPass');
    const DB_NAME = 'sb-ex-db';

    const options: SequelizeOptions = {
      host,
      port,
      username: user,
      password: pass,
      logging: false,
      dialect: 'postgres',
      dialectOptions: {
        multipleStatements: true,
      },
    };

    const tmpSequelize = new Sequelize({ ...options, database: 'postgres' });

    const exists = await tmpSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`,
      { type: QueryTypes.SELECT },
    );

    if (!exists.length) {
      this.logger.log('Database not found, seeding');
      await tmpSequelize.query(`CREATE DATABASE "${DB_NAME}";`);
    } else {
      this.logger.log('Database found, skipping seed.');
    }

    await tmpSequelize.close();

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

    await this.sequelize.sync();
  }

  async onModuleInit() {
    await this.prepareDatabase(this.configService);
  }

  async onModuleDestroy() {
    await this.sequelize.close();
  }

  async registerRequest(data: { filter?: PostFilter; id: UUID }) {
    await Request.create({
      id: data.id,
      filter: data.filter ?? 'none',
      time: new Date(),
    });
  }
}
