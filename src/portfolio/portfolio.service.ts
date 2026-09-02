import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { RoleUser } from '@prisma/client';

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

  async findAll(user: any, requestedUserId?: string) {
    let whereCondition: any;
    if (user.role === RoleUser.ADMIN || user.role === RoleUser.ANALYSTE) {
      whereCondition = requestedUserId ? { userId: requestedUserId } : undefined;
    } else {
      whereCondition = { userId: user.id };
    }

    return this.databaseService.portfolio.findMany({
      where: whereCondition,
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

  async findOne(id: string, user: any) {
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

    if (
      portfolio.userId !== user.id &&
      user.role !== RoleUser.ADMIN &&
      user.role !== RoleUser.ANALYSTE
    ) {
      throw new ForbiddenException('Accès refusé. Ce portefeuille ne vous appartient pas.');
    }

    return portfolio;
  }

  async update(id: string, updatePortfolioDto: UpdatePortfolioDto, user: any) {
    const existing = await this.findOne(id, user);

    if (existing.userId !== user.id && user.role !== RoleUser.ADMIN) {
      throw new ForbiddenException('Accès refusé. Vous ne pouvez modifier que vos propres portefeuilles.');
    }

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

  async remove(id: string, user: any) {
    const existing = await this.findOne(id, user);

    if (existing.userId !== user.id && user.role !== RoleUser.ADMIN) {
      throw new ForbiddenException('Accès refusé. Vous ne pouvez supprimer que vos propres portefeuilles.');
    }

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
