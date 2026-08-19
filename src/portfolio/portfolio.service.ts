import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createPortfolioDto: CreatePortfolioDto, userId: string) {
    return this.databaseService.portfolio.create({
      data: {
        name: createPortfolioDto.name,
        description: createPortfolioDto.description,
        currency: createPortfolioDto.currency ?? 'USD',
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(userId?: string) {
    return this.databaseService.portfolio.findMany({
      where: userId ? { userId } : undefined,
      include: {
        transactions: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const portfolio = await this.databaseService.portfolio.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            instrument: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!portfolio) {
      throw new NotFoundException(`Portfolio avec l'ID ${id} non trouvé`);
    }

    return portfolio;
  }

  async update(id: string, updatePortfolioDto: UpdatePortfolioDto) {
    await this.findOne(id);

    return this.databaseService.portfolio.update({
      where: { id },
      data: updatePortfolioDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const deleted = await this.databaseService.portfolio.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Portfolio supprimé avec succès',
      portfolio: deleted,
    };
  }
}
