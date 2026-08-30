import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreatePortfolioPositionDto } from './dto/create-portfolio_position.dto';
import { UpdatePortfolioPositionDto } from './dto/update-portfolio_position.dto';

@Injectable()
export class PortfolioPositionsService {

  constructor(private readonly databaseService: DatabaseService) {}


  async findAll() {
    return this.databaseService.$queryRaw<
      {
        portfolio_id: string;
        instrument_id: string;
        quantity: Prisma.Decimal;
        average_price: Prisma.Decimal | null;
      }[]
    >`
      SELECT
        portfolio_id,
        instrument_id,
        quantity,
        average_price
      FROM portfolio_positions
      ORDER BY portfolio_id, instrument_id
    `;
  }

  async findByPortfolio(portfolioId: string) {
    return this.databaseService.$queryRaw<
      {
        portfolio_id: string;
        instrument_id: string;
        quantity: Prisma.Decimal;
        average_price: Prisma.Decimal | null;
      }[]
    >`
      SELECT
        portfolio_id,
        instrument_id,
        quantity,
        average_price
      FROM portfolio_positions
      WHERE portfolio_id = ${portfolioId}::uuid
      ORDER BY instrument_id
    `;
  }

  
}
