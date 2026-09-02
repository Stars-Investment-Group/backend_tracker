import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleUser } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PortfolioPositionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(user: any) {
    if (user.role === RoleUser.ADMIN || user.role === RoleUser.ANALYSTE) {
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

    return this.databaseService.$queryRaw<
      {
        portfolio_id: string;
        instrument_id: string;
        quantity: Prisma.Decimal;
        average_price: Prisma.Decimal | null;
      }[]
    >`
      SELECT
        pp.portfolio_id,
        pp.instrument_id,
        pp.quantity,
        pp.average_price
      FROM portfolio_positions pp
      JOIN portfolios p ON p.id = pp.portfolio_id
      WHERE p.user_id = ${user.id}::uuid
      ORDER BY pp.portfolio_id, pp.instrument_id
    `;
  }

  async findByPortfolio(portfolioId: string, user: any) {
    const portfolio = await this.databaseService.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio non trouvé.');
    }

    if (
      portfolio.userId !== user.id &&
      user.role !== RoleUser.ADMIN &&
      user.role !== RoleUser.ANALYSTE
    ) {
      throw new ForbiddenException('Accès refusé. Ce portefeuille ne vous appartient pas.');
    }

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
