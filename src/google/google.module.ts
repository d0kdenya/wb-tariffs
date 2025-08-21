import { Module } from '@nestjs/common';
import { ScheduleModule, Cron } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleService } from './google.service';
import { TariffsModule } from '../tariffs/tariffs.module';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot(), TariffsModule],
  providers: [GoogleService],
  exports: [GoogleService],
})
export class GoogleModule {
  constructor(
    private readonly sheets: GoogleService,
    private readonly cfg: ConfigService,
  ) {}

  @Cron(process.env.CRON_EXPORT_SHEETS || '10 * * * *', {
    name: 'export-sheets-hourly',
    timeZone: process.env.WB_TARIFFS_TIMEZONE || 'Europe/Moscow',
  })
  async scheduleExport() {
    await this.sheets.exportCurrentToAllSheets();
  }
}
