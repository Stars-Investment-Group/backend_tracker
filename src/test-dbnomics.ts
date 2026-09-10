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
  const svc = app.get(UemoaService);

  console.log('\n=== SYNCHRONISATION ===');
  await svc.syncAll();

  console.log('\n=== HISTORIQUE DES REVISIONS (taux de change 2024) ===');
  const hist = await svc.getRevisionHistory('BCEAO', 'TC_A', 'ZZZSF3100A0GP', '2024');
  console.table(
    hist.map((h) => ({
      periode: h.period,
      valeur: h.value,
      millesime: h.vintageDate.toISOString().slice(0, 10),
      courante: h.isLatest ? 'oui' : 'non',
    })),
  );

  console.log('\n=== VERSIONS COURANTES (3 dernieres periodes) ===');
  const cur = await svc.findIndicators({ dataset: 'TC_A' } as any);
  console.table(
    cur.slice(-3).map((r) => ({
      periode: r.period,
      valeur: r.value,
      millesime: r.vintageDate.toISOString().slice(0, 10),
      vue_le: r.lastSeenAt.toISOString().slice(0, 19).replace('T', ' '),
    })),
  );

  await app.close();
}

bootstrap();
