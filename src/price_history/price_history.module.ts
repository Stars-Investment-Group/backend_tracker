import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PriceHistoryService } from './price_history.service';
import { PriceHistoryController } from './price_history.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PriceHistoryController],
  providers: [PriceHistoryService],
  exports: [PriceHistoryService],
})
export class PriceHistoryModule {}
