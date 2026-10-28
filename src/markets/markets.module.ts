import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MarketsController],
  providers: [MarketsService],
  exports: [MarketsService]
})
export class MarketsModule {}
