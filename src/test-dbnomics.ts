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

  const result = await uemoaService.fetchSeries(
    'INSEE',
    'IPC-2015',
    'A.IPC.SO.00.00.INDICE.ENSEMBLE.FE.SO.BRUT.2015.FALSE',
  );

  console.log(JSON.stringify(result, null, 2));

  await app.close();
}

bootstrap();
