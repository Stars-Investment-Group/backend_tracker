import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DatabaseModule } from '../database/database.module';
import { UemoaService } from './uemoa.service';

@Module({
  imports: [HttpModule, DatabaseModule],
  providers: [UemoaService],
  exports: [UemoaService],
})
export class UemoaModule {}
