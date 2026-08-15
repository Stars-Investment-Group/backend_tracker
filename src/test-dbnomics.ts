import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UemoaService } from './uemoa/uemoa.service';

@Module({
  imports: [HttpModule],
  providers: [UemoaService],
})
class TestModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(TestModule);
  const uemoaService = app.get(UemoaService);

  // Taux de change annuel UEMOA - Dollar US, source BCEAO
  const result = await uemoaService.fetchSeries(
    'BCEAO',
    'TC_A',
    'ZZZSF3100A0GP',
  );

  console.log(JSON.stringify(result.series.docs[0], null, 2));

  await app.close();
}

bootstrap();