import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTransactionDto: CreateTransactionDto) {
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

    // Vérifier que le portfolio existe
    const portfolio = await this.databaseService.portfolio.findUnique({
      where: {
        id: portfolioId,
      },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio introuvable');
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

  async findAll(portfolioId?: string) {
    return this.databaseService.transaction.findMany({
      where: portfolioId
        ? {
            portfolioId,
          }
        : undefined,
      include: {
        instrument: true,
        portfolio: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
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

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    await this.findOne(id);

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

  async remove(id: string) {
    await this.findOne(id);

    await this.databaseService.transaction.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Transaction supprimée avec succès',
    };
  }
}
