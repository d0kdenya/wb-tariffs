import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { TariffsService } from '../tariffs/tariffs.service';
import { log } from '../common/logger';

@Injectable()
export class GoogleService {
  constructor(
    private readonly cfg: ConfigService,
    private readonly tariffs: TariffsService,
  ) {}

  private getAuth() {
    const g = this.cfg.get('app').gsheet;
    const jwt = new google.auth.JWT({
      email: g.clientEmail,
      key: g.privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return jwt;
  }

  private headers() {
    return [
      'date',
      'warehouse',
      'geo',
      'delivery_base',
      'delivery_coef',
      'delivery_liter',
      'marketplace_base',
      'marketplace_coef',
      'marketplace_liter',
      'storage_base',
      'storage_coef',
      'storage_liter',
    ];
  }

  async exportCurrentToAllSheets(): Promise<void> {
    const g = this.cfg.get('app').gsheet;
    if (!g.clientEmail || !g.privateKey || g.sheetIds.length === 0) {
      log.warn(
        'Google Sheets не настроен (отсутствуют creds или sheet IDs)! Пропуск!',
      );
      return;
    }

    const rows = await this.tariffs.selectCurrentDaySortedByCoefAsc();

    const values = [
      this.headers(),
      ...rows.map((r) => [
        r.tariff_date,
        r.warehouse_name,
        r.geo_name || '',
        r.box_delivery_base ?? '',
        r.box_delivery_coef_expr ?? '',
        r.box_delivery_liter ?? '',
        r.box_delivery_marketplace_base ?? '',
        r.box_delivery_marketplace_coef_expr ?? '',
        r.box_delivery_marketplace_liter ?? '',
        r.box_storage_base ?? '',
        r.box_storage_coef_expr ?? '',
        r.box_storage_liter ?? '',
      ]),
    ];

    const auth = await this.getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    for (const sheetId of g.sheetIds) {
      const tab = g.tabName;

      await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `${tab}!A:Z`,
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${tab}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values },
      });

      log.info(
        `Exported ${rows.length} rows to spreadsheet ${sheetId} sheet ${tab}`,
      );
    }
  }
}
