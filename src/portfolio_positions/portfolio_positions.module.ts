import { Module } from '@nestjs/common';
import { PortfolioPositionsService } from './portfolio_positions.service';
import { PortfolioPositionsController } from './portfolio_positions.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PortfolioPositionsController],
  providers: [PortfolioPositionsService],
})
export class PortfolioPositionsModule {}
