import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PriceHistoryService } from './price_history.service';
import { DatabaseService } from '../database/database.service';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { QueryPriceHistoryDto, PriceSortOrder } from './dto/query-price-history.dto';

describe('PriceHistoryService', () => {
  let service: PriceHistoryService;
  let dbService: DatabaseService;

  const mockDatabaseService = {
    instrument: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    priceHistory: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  };

  const sampleInstrument = {
    id: '11111111-1111-1111-1111-111111111111',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    currency: 'USD',
    assetClass: 'equity',
  };

  const samplePriceHistory = {
    id: '22222222-2222-2222-2222-222222222222',
    instrumentId: sampleInstrument.id,
    timestamp: new Date('2026-09-01T16:00:00.000Z'),
    open: 185.5,
    high: 188.2,
    low: 184.9,
    close: 187.75,
    volume: 45000000,
    isAdjusted: false,
    createdAt: new Date(),
    instrument: sampleInstrument,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceHistoryService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<PriceHistoryService>(PriceHistoryService);
    dbService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePriceHistoryDto = {
      instrumentId: sampleInstrument.id,
      timestamp: '2026-09-01T16:00:00.000Z',
      open: 185.5,
      high: 188.2,
      low: 184.9,
      close: 187.75,
      volume: 45000000,
      isAdjusted: false,
    };

    it('should throw NotFoundException if instrument does not exist', async () => {
      mockDatabaseService.instrument.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(mockDatabaseService.instrument.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.instrumentId },
      });
    });

    it('should upsert and return price history when instrument exists', async () => {
      mockDatabaseService.instrument.findUnique.mockResolvedValue(sampleInstrument);
      mockDatabaseService.priceHistory.upsert.mockResolvedValue(samplePriceHistory);

      const result = await service.create(createDto);

      expect(mockDatabaseService.instrument.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.instrumentId },
      });
      expect(mockDatabaseService.priceHistory.upsert).toHaveBeenCalledWith({
        where: {
          instrumentId_timestamp: {
            instrumentId: createDto.instrumentId,
            timestamp: new Date(createDto.timestamp),
          },
        },
        update: {
          open: createDto.open,
          high: createDto.high,
          low: createDto.low,
          close: createDto.close,
          volume: createDto.volume,
          isAdjusted: false,
        },
        create: {
          instrumentId: createDto.instrumentId,
          timestamp: new Date(createDto.timestamp),
          open: createDto.open,
          high: createDto.high,
          low: createDto.low,
          close: createDto.close,
          volume: createDto.volume,
          isAdjusted: false,
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
      expect(result).toEqual(samplePriceHistory);
    });
  });

  describe('bulkCreate', () => {
    it('should insert multiple price records sequentially and return count', async () => {
      mockDatabaseService.priceHistory.upsert.mockResolvedValue(samplePriceHistory);

      const bulkDto = {
        prices: [
          {
            instrumentId: sampleInstrument.id,
            timestamp: '2026-09-01T16:00:00.000Z',
            close: 187.75,
          },
          {
            instrumentId: sampleInstrument.id,
            timestamp: '2026-09-02T16:00:00.000Z',
            close: 189.0,
          },
        ],
      };

      const result = await service.bulkCreate(bulkDto);

      expect(mockDatabaseService.priceHistory.upsert).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        success: true,
        message: '2 cotations enregistrées avec succès',
        count: 2,
      });
    });
  });

  describe('findByInstrument', () => {
    it('should throw NotFoundException if instrument is not found', async () => {
      mockDatabaseService.instrument.findUnique.mockResolvedValue(null);

      await expect(
        service.findByInstrument(sampleInstrument.id, {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return paginated price history with date filters', async () => {
      mockDatabaseService.instrument.findUnique.mockResolvedValue(sampleInstrument);
      mockDatabaseService.priceHistory.findMany.mockResolvedValue([samplePriceHistory]);
      mockDatabaseService.priceHistory.count.mockResolvedValue(1);

      const query: QueryPriceHistoryDto = {
        startDate: '2026-08-01T00:00:00.000Z',
        endDate: '2026-09-01T23:59:59.000Z',
        order: PriceSortOrder.DESC,
        limit: 50,
        offset: 0,
      };

      const result = await service.findByInstrument(sampleInstrument.id, query);

      expect(mockDatabaseService.priceHistory.findMany).toHaveBeenCalledWith({
        where: {
          instrumentId: sampleInstrument.id,
          timestamp: {
            gte: new Date(query.startDate!),
            lte: new Date(query.endDate!),
          },
        },
        orderBy: { timestamp: PriceSortOrder.DESC },
        take: 50,
        skip: 0,
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
      expect(result).toEqual({
        total: 1,
        limit: 50,
        offset: 0,
        data: [samplePriceHistory],
      });
    });
  });

  describe('findByTicker', () => {
    it('should find instrument by ticker and return its history', async () => {
      mockDatabaseService.instrument.findFirst.mockResolvedValue(sampleInstrument);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(sampleInstrument);
      mockDatabaseService.priceHistory.findMany.mockResolvedValue([samplePriceHistory]);
      mockDatabaseService.priceHistory.count.mockResolvedValue(1);

      const result = await service.findByTicker('AAPL', {});

      expect(mockDatabaseService.instrument.findFirst).toHaveBeenCalledWith({
        where: { ticker: { equals: 'AAPL', mode: 'insensitive' } },
      });
      expect(result.data).toEqual([samplePriceHistory]);
    });

    it('should throw NotFoundException if ticker is not found', async () => {
      mockDatabaseService.instrument.findFirst.mockResolvedValue(null);

      await expect(service.findByTicker('UNKNOWN', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getLatestPrice', () => {
    it('should return latest quote for instrument', async () => {
      mockDatabaseService.instrument.findUnique.mockResolvedValue(sampleInstrument);
      mockDatabaseService.priceHistory.findFirst.mockResolvedValue(samplePriceHistory);

      const result = await service.getLatestPrice(sampleInstrument.id);

      expect(mockDatabaseService.priceHistory.findFirst).toHaveBeenCalledWith({
        where: { instrumentId: sampleInstrument.id },
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
      expect(result).toEqual(samplePriceHistory);
    });

    it('should throw NotFoundException if no quotes exist for instrument', async () => {
      mockDatabaseService.instrument.findUnique.mockResolvedValue(sampleInstrument);
      mockDatabaseService.priceHistory.findFirst.mockResolvedValue(null);

      await expect(
        service.getLatestPrice(sampleInstrument.id),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete existing price quote by ID', async () => {
      mockDatabaseService.priceHistory.findUnique.mockResolvedValue(samplePriceHistory);
      mockDatabaseService.priceHistory.delete.mockResolvedValue(samplePriceHistory);

      const result = await service.remove(samplePriceHistory.id);

      expect(mockDatabaseService.priceHistory.delete).toHaveBeenCalledWith({
        where: { id: samplePriceHistory.id },
      });
      expect(result).toEqual({
        success: true,
        message: 'Cotation supprimée avec succès',
      });
    });

    it('should throw NotFoundException when deleting non-existent quote', async () => {
      mockDatabaseService.priceHistory.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
