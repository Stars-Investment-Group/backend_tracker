import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { BulkCreatePriceHistoryDto } from './dto/bulk-create-price-history.dto';
import { QueryPriceHistoryDto, PriceSortOrder } from './dto/query-price-history.dto';

@Injectable()
export class PriceHistoryService {
  private readonly logger = new Logger(PriceHistoryService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Enregistre ou met à jour une cotation de cours (OHLCV)
   */
  async create(dto: CreatePriceHistoryDto) {
    const instrument = await this.databaseService.instrument.findUnique({
      where: { id: dto.instrumentId },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument avec l'ID ${dto.instrumentId} non trouvé.`);
    }

    const timestamp = new Date(dto.timestamp);

    return this.databaseService.priceHistory.upsert({
      where: {
        instrumentId_timestamp: {
          instrumentId: dto.instrumentId,
          timestamp,
        },
      },
      update: {
        open: dto.open,
        high: dto.high,
        low: dto.low,
        close: dto.close,
        volume: dto.volume,
        isAdjusted: dto.isAdjusted ?? false,
      },
      create: {
        instrumentId: dto.instrumentId,
        timestamp,
        open: dto.open,
        high: dto.high,
        low: dto.low,
        close: dto.close,
        volume: dto.volume,
        isAdjusted: dto.isAdjusted ?? false,
      },
      include: {
        instrument: {
          select: {
            id: true,
            ticker: true,
            name: true,
            currency: true,
            assetClass: true,
          },
        },
      },
    });
  }

  /**
   * Ingestion en lot de cotations de cours
   */
  async bulkCreate(dto: BulkCreatePriceHistoryDto) {
    let insertedCount = 0;

    for (const item of dto.prices) {
      const timestamp = new Date(item.timestamp);
      await this.databaseService.priceHistory.upsert({
        where: {
          instrumentId_timestamp: {
            instrumentId: item.instrumentId,
            timestamp,
          },
        },
        update: {
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          isAdjusted: item.isAdjusted ?? false,
        },
        create: {
          instrumentId: item.instrumentId,
          timestamp,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          isAdjusted: item.isAdjusted ?? false,
        },
      });
      insertedCount++;
    }

    return {
      success: true,
      message: `${insertedCount} cotations enregistrées avec succès`,
      count: insertedCount,
    };
  }

  /**
   * Récupère l'historique des cours d'un instrument par son ID
   */
  async findByInstrument(instrumentId: string, query: QueryPriceHistoryDto) {
    const instrument = await this.databaseService.instrument.findUnique({
      where: { id: instrumentId },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument avec l'ID ${instrumentId} non trouvé.`);
    }

    const where: any = { instrumentId };

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) where.timestamp.gte = new Date(query.startDate);
      if (query.endDate) where.timestamp.lte = new Date(query.endDate);
    }

    const [prices, total] = await Promise.all([
      this.databaseService.priceHistory.findMany({
        where,
        orderBy: {
          timestamp: query.order ?? PriceSortOrder.DESC,
        },
        take: query.limit ?? 100,
        skip: query.offset ?? 0,
        include: {
          instrument: {
            select: {
              id: true,
              ticker: true,
              name: true,
              currency: true,
              assetClass: true,
            },
          },
        },
      }),
      this.databaseService.priceHistory.count({ where }),
    ]);

    return {
      total,
      limit: query.limit ?? 100,
      offset: query.offset ?? 0,
      data: prices,
    };
  }

  /**
   * Récupère l'historique des cours par symbole boursier (ticker)
   */
  async findByTicker(ticker: string, query: QueryPriceHistoryDto) {
    const instrument = await this.databaseService.instrument.findFirst({
      where: { ticker: { equals: ticker, mode: 'insensitive' } },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument avec le ticker "${ticker}" non trouvé.`);
    }

    return this.findByInstrument(instrument.id, query);
  }

  /**
   * Récupère le dernier cours de clôture connu d'un instrument
   */
  async getLatestPrice(instrumentId: string) {
    const instrument = await this.databaseService.instrument.findUnique({
      where: { id: instrumentId },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument avec l'ID ${instrumentId} non trouvé.`);
    }

    const latest = await this.databaseService.priceHistory.findFirst({
      where: { instrumentId },
      orderBy: { timestamp: 'desc' },
      include: {
        instrument: {
          select: {
            id: true,
            ticker: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!latest) {
      throw new NotFoundException(`Aucune cotation trouvée pour l'instrument ${instrument.ticker ?? instrumentId}.`);
    }

    return latest;
  }

  /**
   * Supprime une cotation spécifique
   */
  async remove(id: string) {
    const existing = await this.databaseService.priceHistory.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Cotation avec l'ID ${id} non trouvée.`);
    }

    await this.databaseService.priceHistory.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Cotation supprimée avec succès',
    };
  }
}
