import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssetClass, EventImpact, NewsSentiment } from '@prisma/client';
import { NewsService } from './news.service';
import { DatabaseService } from '../database/database.service';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { CreateEconomicEventDto } from './dto/create-economic-event.dto';

describe('NewsService', () => {
  let service: NewsService;
  let dbService: DatabaseService;

  const mockDatabaseService = {
    instrument: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    newsArticle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    newsInstrument: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    portfolio: {
      findMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
    economicEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const sampleInstrument = {
    id: '11111111-1111-1111-1111-111111111111',
    ticker: 'SNTS',
    name: 'Sonatel SN',
    currency: 'XOF',
    assetClass: AssetClass.equity,
  };

  const sampleArticle = {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Hausse historique du cours de Sonatel à la BRVM',
    content: 'La Sonatel a clôturé en forte hausse suite à ses résultats trimestriels.',
    summary: 'Forte progression du titre Sonatel.',
    sentiment: NewsSentiment.positive,
    source: 'Financial Afrik',
    url: 'https://financialafrik.com/sonatel-hausse',
    assetClass: AssetClass.equity,
    isBreaking: true,
    readCount: 150,
    publishedAt: new Date('2026-09-05T10:00:00.000Z'),
    createdAt: new Date('2026-09-05T10:00:00.000Z'),
    updatedAt: new Date('2026-09-05T10:00:00.000Z'),
    instruments: [
      {
        newsId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        instrumentId: sampleInstrument.id,
        instrument: sampleInstrument,
      },
    ],
  };

  const sampleEconomicEvent = {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Taux Directeur BCEAO',
    country: 'CIV',
    eventDate: new Date('2026-09-10T10:00:00.000Z'),
    impact: EventImpact.high,
    actual: '3.50%',
    forecast: '3.50%',
    previous: '3.25%',
    unit: '%',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    dbService = module.get<DatabaseService>(DatabaseService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createArticle', () => {
    const createDto: CreateNewsArticleDto = {
      title: 'Hausse historique du cours de Sonatel à la BRVM',
      content: 'La Sonatel a clôturé en forte hausse suite à ses résultats trimestriels.',
      summary: 'Forte progression du titre Sonatel.',
      sentiment: NewsSentiment.positive,
      source: 'Financial Afrik',
      url: 'https://financialafrik.com/sonatel-hausse',
      assetClass: AssetClass.equity,
      isBreaking: true,
      instrumentIds: [sampleInstrument.id],
    };

    it('should create an article with instruments when valid', async () => {
      mockDatabaseService.instrument.findMany.mockResolvedValue([{ id: sampleInstrument.id }]);
      mockDatabaseService.newsArticle.create.mockResolvedValue(sampleArticle);

      const result = await service.createArticle(createDto);

      expect(mockDatabaseService.instrument.findMany).toHaveBeenCalledWith({
        where: { id: { in: [sampleInstrument.id] } },
        select: { id: true },
      });
      expect(mockDatabaseService.newsArticle.create).toHaveBeenCalled();
      expect(result).toEqual(sampleArticle);
    });

    it('should throw BadRequestException if any instrumentId is invalid', async () => {
      mockDatabaseService.instrument.findMany.mockResolvedValue([]);

      await expect(service.createArticle(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBreakingNews', () => {
    it('should return breaking news ordered by publishedAt desc', async () => {
      mockDatabaseService.newsArticle.count.mockResolvedValue(1);
      mockDatabaseService.newsArticle.findMany.mockResolvedValue([sampleArticle]);

      const result = await service.getBreakingNews(10, 0);

      expect(mockDatabaseService.newsArticle.findMany).toHaveBeenCalledWith({
        where: { isBreaking: true },
        include: { instruments: { include: { instrument: true } } },
        orderBy: { publishedAt: 'desc' },
        take: 10,
        skip: 0,
      });
      expect(result).toEqual({
        total: 1,
        limit: 10,
        offset: 0,
        data: [sampleArticle],
      });
    });
  });

  describe('getMostRead', () => {
    it('should return most read articles', async () => {
      mockDatabaseService.newsArticle.count.mockResolvedValue(1);
      mockDatabaseService.newsArticle.findMany.mockResolvedValue([sampleArticle]);

      const result = await service.getMostRead(5, 0);

      expect(mockDatabaseService.newsArticle.findMany).toHaveBeenCalledWith({
        include: { instruments: { include: { instrument: true } } },
        orderBy: [{ readCount: 'desc' }, { publishedAt: 'desc' }],
        take: 5,
        skip: 0,
      });
      expect(result.data).toEqual([sampleArticle]);
    });
  });

  describe('getByAssetClass', () => {
    it('should filter articles by asset class', async () => {
      mockDatabaseService.newsArticle.count.mockResolvedValue(1);
      mockDatabaseService.newsArticle.findMany.mockResolvedValue([sampleArticle]);

      const result = await service.getByAssetClass(AssetClass.equity, 20, 0);

      expect(mockDatabaseService.newsArticle.findMany).toHaveBeenCalledWith({
        where: { assetClass: AssetClass.equity },
        include: { instruments: { include: { instrument: true } } },
        orderBy: { publishedAt: 'desc' },
        take: 20,
        skip: 0,
      });
      expect(result.data).toEqual([sampleArticle]);
    });
  });

  describe('searchNews', () => {
    it('should search news with filters', async () => {
      mockDatabaseService.newsArticle.count.mockResolvedValue(1);
      mockDatabaseService.newsArticle.findMany.mockResolvedValue([sampleArticle]);

      const query: QueryNewsDto = {
        q: 'Sonatel',
        ticker: 'SNTS',
        assetClass: AssetClass.equity,
        sentiment: NewsSentiment.positive,
        limit: 10,
        offset: 0,
      };

      const result = await service.searchNews(query);

      expect(mockDatabaseService.newsArticle.findMany).toHaveBeenCalled();
      expect(result.total).toBe(1);
      expect(result.data).toEqual([sampleArticle]);
    });
  });

  describe('findOne', () => {
    it('should return article without incrementing views by default', async () => {
      mockDatabaseService.newsArticle.findUnique.mockResolvedValue(sampleArticle);

      const result = await service.findOne(sampleArticle.id, false);

      expect(mockDatabaseService.newsArticle.findUnique).toHaveBeenCalledWith({
        where: { id: sampleArticle.id },
        include: { instruments: { include: { instrument: true } } },
      });
      expect(result).toEqual(sampleArticle);
    });

    it('should increment readCount when incrementViews is true', async () => {
      const updatedArticle = { ...sampleArticle, readCount: sampleArticle.readCount + 1 };
      mockDatabaseService.newsArticle.update.mockResolvedValue(updatedArticle);

      const result = await service.findOne(sampleArticle.id, true);

      expect(mockDatabaseService.newsArticle.update).toHaveBeenCalledWith({
        where: { id: sampleArticle.id },
        data: { readCount: { increment: 1 } },
        include: { instruments: { include: { instrument: true } } },
      });
      expect(result).toEqual(updatedArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockDatabaseService.newsArticle.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', false)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateArticle', () => {
    const updateDto: UpdateNewsArticleDto = {
      title: 'Titre Modifié',
      instrumentIds: [sampleInstrument.id],
    };

    it('should update article and sync instruments', async () => {
      mockDatabaseService.newsArticle.findUnique.mockResolvedValue(sampleArticle);
      mockDatabaseService.instrument.findMany.mockResolvedValue([{ id: sampleInstrument.id }]);
      mockDatabaseService.newsInstrument.deleteMany.mockResolvedValue({ count: 1 });
      mockDatabaseService.newsInstrument.createMany.mockResolvedValue({ count: 1 });
      mockDatabaseService.newsArticle.update.mockResolvedValue({
        ...sampleArticle,
        title: 'Titre Modifié',
      });

      const result = await service.updateArticle(sampleArticle.id, updateDto);

      expect(mockDatabaseService.newsInstrument.deleteMany).toHaveBeenCalledWith({
        where: { newsId: sampleArticle.id },
      });
      expect(result.title).toBe('Titre Modifié');
    });
  });

  describe('deleteArticle', () => {
    it('should delete article by ID', async () => {
      mockDatabaseService.newsArticle.findUnique.mockResolvedValue(sampleArticle);
      mockDatabaseService.newsArticle.delete.mockResolvedValue(sampleArticle);

      const result = await service.deleteArticle(sampleArticle.id);

      expect(mockDatabaseService.newsArticle.delete).toHaveBeenCalledWith({
        where: { id: sampleArticle.id },
      });
      expect(result).toEqual({
        success: true,
        message: 'Article supprimé avec succès',
      });
    });
  });

  describe('getPortfolioImpact', () => {
    const sampleUser = { id: 'user-1111-1111', role: 'USER' };

    it('should return impacted positions when user holds linked instruments', async () => {
      mockDatabaseService.newsArticle.findUnique.mockResolvedValue(sampleArticle);
      mockDatabaseService.portfolio.findMany.mockResolvedValue([
        { id: 'port-1', name: 'Portefeuille Actions' },
      ]);
      mockDatabaseService.transaction.findMany.mockResolvedValue([
        {
          portfolioId: 'port-1',
          instrumentId: sampleInstrument.id,
          transactionType: 'buy',
          quantity: 100,
          instrument: sampleInstrument,
          portfolio: { id: 'port-1', name: 'Portefeuille Actions' },
        },
      ]);

      const result = await service.getPortfolioImpact(sampleArticle.id, sampleUser);

      expect(result.impacted).toBe(true);
      expect(result.impactedPositions.length).toBe(1);
      expect(result.impactedPositions[0].netQuantity).toBe(100);
      expect(result.sentiment).toBe(NewsSentiment.positive);
    });

    it('should return non-impacted response if user holds no positions', async () => {
      mockDatabaseService.newsArticle.findUnique.mockResolvedValue(sampleArticle);
      mockDatabaseService.portfolio.findMany.mockResolvedValue([
        { id: 'port-1', name: 'Portefeuille Actions' },
      ]);
      mockDatabaseService.transaction.findMany.mockResolvedValue([]);

      const result = await service.getPortfolioImpact(sampleArticle.id, sampleUser);

      expect(result.impacted).toBe(false);
      expect(result.impactedPositions).toEqual([]);
    });
  });

  describe('economicCalendar', () => {
    it('should return calendar events for this_week', async () => {
      mockDatabaseService.economicEvent.findMany.mockResolvedValue([sampleEconomicEvent]);

      const result = await service.getEconomicCalendar('this_week', 'CIV', EventImpact.high);

      expect(mockDatabaseService.economicEvent.findMany).toHaveBeenCalled();
      expect(result.count).toBe(1);
      expect(result.data).toEqual([sampleEconomicEvent]);
    });

    it('should create an economic event', async () => {
      const createDto: CreateEconomicEventDto = {
        title: 'Taux Directeur BCEAO',
        country: 'CIV',
        eventDate: new Date('2026-09-10T10:00:00.000Z'),
        impact: EventImpact.high,
      };

      mockDatabaseService.economicEvent.create.mockResolvedValue(sampleEconomicEvent);

      const result = await service.createEconomicEvent(createDto);

      expect(mockDatabaseService.economicEvent.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(sampleEconomicEvent);
    });
  });
});
