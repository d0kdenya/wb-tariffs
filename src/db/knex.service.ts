import { Injectable, OnModuleInit } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { ConfigService } from '@nestjs/config';
import { log } from '../common/logger';

@Injectable()
export class KnexService implements OnModuleInit {
  private _knex!: Knex;

  constructor(private readonly config: ConfigService) {}

  get db(): Knex {
    return this._knex;
  }

  async onModuleInit() {
    const cfg = this.config.get('app');
    const useUrl = !!cfg.db.url;

    this._knex = knex({
      client: 'pg',
      connection: useUrl
        ? cfg.db.url
        : {
            host: cfg.db.host,
            port: cfg.db.port,
            user: cfg.db.user,
            password: cfg.db.password,
            database: cfg.db.database,
          },
      pool: { min: 2, max: 10 },
      migrations: {
        tableName: 'knex_migrations',
        directory: __dirname + '/../../migrations',
      },
    });

    log.info('Подключение БД…');
    await this._knex.raw('select 1');

    log.info('Запуск миграций…');
    await this._knex.migrate.latest();

    log.info('БД готова!');
  }
}
