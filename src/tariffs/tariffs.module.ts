import { Module } from '@nestjs/common';
import { TariffsService } from './tariffs.service';
import { ScheduleModule } from '@nestjs/schedule';
import { KnexModule } from '../db/knex.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, KnexModule, ScheduleModule.forRoot()],
  providers: [TariffsService],
  exports: [TariffsService],
})
export class TariffsModule {}
