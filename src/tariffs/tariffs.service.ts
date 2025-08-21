import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DateTime } from 'luxon';
import { KnexService } from '../db/knex.service';
import { parseRuNumber } from '../common/utils/number';
import { WbBoxResponse, WbBoxWarehouseItem } from './tariffs.types';
import { log } from '../common/logger';

@Injectable()
export class TariffsService implements OnModuleInit {
  constructor(
    private readonly cfg: ConfigService,
    private readonly knex: KnexService,
  ) {}

  async onModuleInit() {
    const auto = this.cfg.get<boolean>('app.autoRunOnStart');
    if (auto) {
      await this.fetchAndUpsertForToday().catch((e) =>
        log.error('Ошибка выборки при запуске', e),
      );
    }
  }

  @Cron(process.env.CRON_FETCH_TARIFFS || '0 * * * *', {
    name: 'fetch-tariffs-hourly',
    timeZone: process.env.WB_TARIFFS_TIMEZONE || 'Europe/Moscow',
  })
  async fetchAndUpsertForToday(): Promise<void> {
    const app = this.cfg.get('app');
    const tz = app.wb.timezone;
    const today = DateTime.now().setZone(tz).toFormat('yyyy-LL-dd');

    const url = `${app.wb.base}${app.wb.boxPath}?date=${encodeURIComponent(today)}`;

    log.info('Получение тарифов WB', { url, tz, today });

    const res = await axios.get<WbBoxResponse>(url, {
      headers: {
        Authorization: app.wb.token,
      },
      timeout: 30000,
    });

    const payload = res.data?.response?.data;
    if (!payload || !Array.isArray(payload.warehouseList)) {
      log.warn('Некорректный формат данных для WB!');
      return;
    }

    const dtNextBox = payload.dtNextBox
      ? DateTime.fromISO(payload.dtNextBox).toFormat('yyyy-LL-dd')
      : null;
    const dtTillMax = payload.dtTillMax
      ? DateTime.fromISO(payload.dtTillMax).toFormat('yyyy-LL-dd')
      : null;

    const rows = payload.warehouseList.map((w) =>
      this.mapWarehouseItemToDbRow(w, today, dtNextBox, dtTillMax),
    );

    const db = this.knex.db;
    const chunkSize = 100;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      await db('wb_box_tariffs_daily')
        .insert(chunk)
        .onConflict(['tariff_date', 'warehouse_name'])
        .merge({
          geo_name: db.raw('EXCLUDED.geo_name'),
          box_delivery_and_storage_expr: db.raw(
            'EXCLUDED.box_delivery_and_storage_expr',
          ),
          box_delivery_base: db.raw('EXCLUDED.box_delivery_base'),
          box_delivery_coef_expr: db.raw('EXCLUDED.box_delivery_coef_expr'),
          box_delivery_liter: db.raw('EXCLUDED.box_delivery_liter'),
          box_delivery_marketplace_base: db.raw(
            'EXCLUDED.box_delivery_marketplace_base',
          ),
          box_delivery_marketplace_coef_expr: db.raw(
            'EXCLUDED.box_delivery_marketplace_coef_expr',
          ),
          box_delivery_marketplace_liter: db.raw(
            'EXCLUDED.box_delivery_marketplace_liter',
          ),
          box_storage_base: db.raw('EXCLUDED.box_storage_base'),
          box_storage_coef_expr: db.raw('EXCLUDED.box_storage_coef_expr'),
          box_storage_liter: db.raw('EXCLUDED.box_storage_liter'),
          dt_next_box: db.raw('EXCLUDED.dt_next_box'),
          dt_till_max: db.raw('EXCLUDED.dt_till_max'),
          last_fetched_at: db.fn.now(),
          updated_at: db.fn.now(),
        });
    }

    log.info(`Изменено ${rows.length} строк для даты=${today}`);

    this.exportToGoogleSheets().catch((e) =>
      log.error('Ошибка экспорта (post-fetch)', e),
    );
  }

  private mapWarehouseItemToDbRow(
    w: WbBoxWarehouseItem,
    tariffDate: string,
    dtNextBox: string | null,
    dtTillMax: string | null,
  ) {
    return {
      tariff_date: tariffDate,
      warehouse_name: w.warehouseName,
      geo_name: w.geoName ?? null,
      box_delivery_and_storage_expr: w.boxDeliveryAndStorageExpr ?? null,

      box_delivery_base: parseRuNumber(w.boxDeliveryBase),
      box_delivery_coef_expr: parseRuNumber(w.boxDeliveryCoefExpr),
      box_delivery_liter: parseRuNumber(w.boxDeliveryLiter),

      box_delivery_marketplace_base: parseRuNumber(
        w.boxDeliveryMarketplaceBase,
      ),
      box_delivery_marketplace_coef_expr: parseRuNumber(
        w.boxDeliveryMarketplaceCoefExpr,
      ),
      box_delivery_marketplace_liter: parseRuNumber(
        w.boxDeliveryMarketplaceLiter,
      ),

      box_storage_base: parseRuNumber(w.boxStorageBase),
      box_storage_coef_expr: parseRuNumber(w.boxStorageCoefExpr),
      box_storage_liter: parseRuNumber(w.boxStorageLiter),

      dt_next_box: dtNextBox,
      dt_till_max: dtTillMax,
      last_fetched_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  async selectCurrentDaySortedByCoefAsc() {
    const tz = this.cfg.get('app').wb.timezone;
    const today = DateTime.now().setZone(tz).toFormat('yyyy-LL-dd');

    const db = this.knex.db;
    const rows = await db('wb_box_tariffs_daily')
      .select(
        'tariff_date',
        'warehouse_name',
        'geo_name',
        'box_delivery_base',
        'box_delivery_coef_expr',
        'box_delivery_liter',
        'box_delivery_marketplace_base',
        'box_delivery_marketplace_coef_expr',
        'box_delivery_marketplace_liter',
        'box_storage_base',
        'box_storage_coef_expr',
        'box_storage_liter',
      )
      .where({ tariff_date: today })
      .orderBy([
        { column: 'box_delivery_coef_expr', order: 'asc' },
        { column: 'warehouse_name', order: 'asc' },
      ]);

    return rows;
  }

  async exportToGoogleSheets(): Promise<void> {}
}
