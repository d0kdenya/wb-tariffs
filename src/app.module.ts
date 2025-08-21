import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './configs/config';
import { KnexModule } from './db/knex.module';
import { TariffsModule } from './tariffs/tariffs.module';
import { GoogleModule } from './google/google.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    KnexModule,
    TariffsModule,
    GoogleModule,
  ],
})
export class AppModule {}
