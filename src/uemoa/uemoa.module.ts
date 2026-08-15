import { Module } from '@nestjs/common';
import { UemoaService } from './uemoa.service';

@Module({
  providers: [UemoaService]
})
export class UemoaModule {}
