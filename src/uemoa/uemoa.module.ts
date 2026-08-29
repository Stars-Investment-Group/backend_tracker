import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../database/database.module';
import { UemoaService } from './uemoa.service';

@Module({
  imports: [HttpModule, DatabaseModule, ScheduleModule.forRoot()],
  providers: [UemoaService],
  exports: [UemoaService],
})
export class UemoaModule {}
