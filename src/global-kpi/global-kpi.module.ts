import { Module } from '@nestjs/common';
import { GlobalKpiService } from './global-kpi.service';
import { GlobalKpiController } from './global-kpi.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GlobalKpiController],
  providers: [GlobalKpiService],
  exports: [GlobalKpiService]
})
export class GlobalKpiModule {}
