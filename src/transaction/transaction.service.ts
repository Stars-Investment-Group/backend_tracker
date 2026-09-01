import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { RoleUser } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTransactionDto: CreateTransactionDto, user: any) {
    const {
      portfolioId,
      instrumentId,
      transactionType,
      quantity,
      price,
      fees,
      transactionDate,
      notes,
    } = createTransactionDto;

    // Vérifier que le portfolio existe et appartient à l'utilisateur
    const portfolio = await this.databaseService.portfolio.findUnique({
      where: {
        id: portfolioId,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio introuvable');
    }

    if (
      portfolio.userId !== user.id &&
      user.role !== RoleUser.ADMIN &&
      user.role !== RoleUser.ANALYSTE
    ) {
      throw new ForbiddenException('Accès refusé. Ce portefeuille ne vous appartient pas.');
    }

    // Vérifier que l'instrument existe
    const instrument = await this.databaseService.instrument.findUnique({
      where: {
        id: instrumentId,
      },
    });

    if (!instrument) {
      throw new NotFoundException('Instrument introuvable');
    }

    // Vérification métier
    if (quantity <= 0) {
      throw new BadRequestException('La quantité doit être supérieure à 0');
    }

    if (price < 0) {
      throw new BadRequestException('Le prix ne peut pas être négatif');
    }

    // Vérification de solde en cas de vente
    if (transactionType === 'sell') {
      const transactions = await this.databaseService.transaction.findMany({
        where: {
          portfolioId,
          instrumentId,
        },
        select: {
          transactionType: true,
          quantity: true,
        },
      });

      const currentHolding = transactions.reduce((acc, t) => {
        const qty = Number(t.quantity);
        if (t.transactionType === 'buy') return acc + qty;
        if (t.transactionType === 'sell') return acc - qty;
        return acc;
      }, 0);

      if (currentHolding < quantity) {
        throw new BadRequestException(
          `Solde insuffisant pour vendre. Quantité disponible : ${currentHolding}, Quantité demandée : ${quantity}`,
        );
      }
    }

    const transaction = await this.databaseService.transaction.create({
      data: {
        portfolioId,
        instrumentId,
        transactionType,
        quantity,
        price,
        fees: fees ?? 0,
        transactionDate: new Date(transactionDate),
        notes,
      },
      include: {
        portfolio: true,
        instrument: true,
      },
    });

    return {
      success: true,
      message: 'Transaction créée avec succès',
      transaction,
    };
  }

  async findAll(user: any, portfolioId?: string) {
    let whereCondition: any;

    if (user.role === RoleUser.ADMIN || user.role === RoleUser.ANALYSTE) {
      whereCondition = portfolioId ? { portfolioId } : undefined;
    } else {
      whereCondition = {
        portfolio: { userId: user.id },
        ...(portfolioId ? { portfolioId } : {}),
      };
    }

    return this.databaseService.transaction.findMany({
      where: whereCondition,
      include: {
        instrument: true,
        portfolio: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });
  }

  async findOne(id: string, user: any) {
    const transaction = await this.databaseService.transaction.findUnique({
      where: {
        id,
      },
      include: {
        instrument: true,
        portfolio: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction introuvable');
    }

    if (
      transaction.portfolio.userId !== user.id &&
      user.role !== RoleUser.ADMIN &&
      user.role !== RoleUser.ANALYSTE
    ) {
      throw new ForbiddenException('Accès refusé. Cette transaction ne vous appartient pas.');
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, user: any) {
    const existing = await this.findOne(id, user);

    if (existing.portfolio.userId !== user.id && user.role !== RoleUser.ADMIN) {
      throw new ForbiddenException('Accès refusé. Vous ne pouvez modifier que vos propres transactions.');
    }

    if (updateTransactionDto.quantity !== undefined && updateTransactionDto.quantity <= 0) {
      throw new BadRequestException('La quantité doit être supérieure à 0');
    }

    if (updateTransactionDto.price !== undefined && updateTransactionDto.price < 0) {
      throw new BadRequestException('Le prix ne peut pas être négatif');
    }

    if (updateTransactionDto.portfolioId) {
      const portfolio = await this.databaseService.portfolio.findUnique({
        where: { id: updateTransactionDto.portfolioId },
      });
      if (!portfolio) throw new NotFoundException('Portfolio introuvable');
      if (portfolio.userId !== user.id && user.role !== RoleUser.ADMIN) {
        throw new ForbiddenException('Accès refusé. Le portfolio de destination ne vous appartient pas.');
      }
    }

    if (updateTransactionDto.instrumentId) {
      const instrument = await this.databaseService.instrument.findUnique({
        where: { id: updateTransactionDto.instrumentId },
      });
      if (!instrument) throw new NotFoundException('Instrument introuvable');
    }

    const transaction = await this.databaseService.transaction.update({
      where: { id },
      data: {
        portfolioId: updateTransactionDto.portfolioId,
        instrumentId: updateTransactionDto.instrumentId,
        transactionType: updateTransactionDto.transactionType,
        quantity: updateTransactionDto.quantity,
        price: updateTransactionDto.price,
        fees: updateTransactionDto.fees,
        transactionDate: updateTransactionDto.transactionDate
          ? new Date(updateTransactionDto.transactionDate)
          : undefined,
        notes: updateTransactionDto.notes,
      },
      include: {
        instrument: true,
        portfolio: true,
      },
    });

    return {
      success: true,
      message: 'Transaction mise à jour avec succès',
      transaction,
    };
  }

  async remove(id: string, user: any) {
    const existing = await this.findOne(id, user);

    if (existing.portfolio.userId !== user.id && user.role !== RoleUser.ADMIN) {
      throw new ForbiddenException('Accès refusé. Vous ne pouvez supprimer que vos propres transactions.');
    }

    await this.databaseService.transaction.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Transaction supprimée avec succès',
    };
  }
}
