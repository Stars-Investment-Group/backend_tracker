import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
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
      throw new BadRequestException(
        'La quantité doit être supérieure à 0',
      );
    }

    if (price < 0) {
      throw new BadRequestException(
        'Le prix ne peut pas être négatif',
      );
    }

    const transaction =
      await this.databaseService.transaction.create({
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
    const transaction =
      await this.databaseService.transaction.findUnique({
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

}
