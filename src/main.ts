import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { log } from './common/logger';
import { KnexService } from './db/knex.service';
import { TariffsService } from './tariffs/tariffs.service';
import { GoogleService } from './google/google.service';
import { ModuleRef } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const cfg = app.get(ConfigService);
  const port = cfg.get<number>('app.port') || 3000;

  const express = app.getHttpAdapter().getInstance();
  express.get('/health', (_req: any, res: any) => res.status(200).send('OK'));

  await app.listen(port);
  log.info(`Приложение запущено на порту :${port}`);

  const moduleRef = app.get(ModuleRef);
  moduleRef.get(KnexService, { strict: false });
  const tariffs = moduleRef.get(TariffsService, { strict: false });
  const sheets = moduleRef.get(GoogleService, { strict: false });

  const auto = cfg.get<boolean>('app.autoRunOnStart');
  if (auto) {
    try {
      await tariffs.fetchAndUpsertForToday();
      await sheets.exportCurrentToAllSheets();
    } catch (e) {
      log.error('Ошибка инициализации автозапуска', e);
    }
  }
}

bootstrap();
