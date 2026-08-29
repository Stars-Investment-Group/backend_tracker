import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from './database/database.module';
import { UemoaService } from './uemoa/uemoa.service';

@Module({
  imports: [HttpModule, DatabaseModule],
  providers: [UemoaService],
})
class TestModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(TestModule);
  const uemoaService = app.get(UemoaService);

  console.log('--- Sync taux de change UMOA/USD ---');
  const count1 = await uemoaService.syncSeries('BCEAO', 'TC_A', 'ZZZSF3100A0GP');
  console.log(`${count1} lignes sauvegardées.`);

  console.log('--- Sync PIB nominal Sénégal ---');
  const count2 = await uemoaService.syncSeries('BCEAO', 'PIBN', 'KKKSR1015A0BP', 'SN');
  console.log(`${count2} lignes sauvegardées.`);

  await app.close();
}

bootstrap();
