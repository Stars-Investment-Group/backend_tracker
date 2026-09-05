import { Test, TestingModule } from '@nestjs/testing';
import { AssetClass, EventImpact, NewsSentiment } from '@prisma/client';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { CreateEconomicEventDto } from './dto/create-economic-event.dto';

describe('NewsController', () => {
  let controller: NewsController;
  let service: NewsService;

  const sampleArticle = {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    title: 'Hausse historique du cours de Sonatel à la BRVM',
    content: 'Contenu article',
    summary: 'Résumé article',
    sentiment: NewsSentiment.positive,
    assetClass: AssetClass.equity,
    isBreaking: true,
    readCount: 150,
    publishedAt: new Date(),
    instruments: [],
  };

  const sampleEconomicEvent = {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    title: 'Taux Directeur BCEAO',
    country: 'CIV',
    eventDate: new Date(),
    impact: EventImpact.high,
  };

  const mockNewsService = {
    getBreakingNews: jest.fn(),
    getMostRead: jest.fn(),
    getByAssetClass: jest.fn(),
    searchNews: jest.fn(),
    getEconomicCalendar: jest.fn(),
    getEconomicEvents: jest.fn(),
    createEconomicEvent: jest.fn(),
    getPortfolioImpact: jest.fn(),
    findOne: jest.fn(),
    createArticle: jest.fn(),
    updateArticle: jest.fn(),
    deleteArticle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: mockNewsService,
        },
      ],
    }).compile();

    controller = module.get<NewsController>(NewsController);
    service = module.get<NewsService>(NewsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBreakingNews', () => {
    it('should call newsService.getBreakingNews', async () => {
      mockNewsService.getBreakingNews.mockResolvedValue({ total: 1, data: [sampleArticle] });

      const result = await controller.getBreakingNews(10, 0);

      expect(mockNewsService.getBreakingNews).toHaveBeenCalledWith(10, 0);
      expect(result).toEqual({ total: 1, data: [sampleArticle] });
    });
  });

  describe('getMostRead', () => {
    it('should call newsService.getMostRead', async () => {
      mockNewsService.getMostRead.mockResolvedValue({ total: 1, data: [sampleArticle] });

      const result = await controller.getMostRead(5, 0);

      expect(mockNewsService.getMostRead).toHaveBeenCalledWith(5, 0);
      expect(result).toEqual({ total: 1, data: [sampleArticle] });
    });
  });

  describe('getByAssetClass', () => {
    it('should call newsService.getByAssetClass', async () => {
      mockNewsService.getByAssetClass.mockResolvedValue({ total: 1, data: [sampleArticle] });

      const result = await controller.getByAssetClass(AssetClass.equity, 20, 0);

      expect(mockNewsService.getByAssetClass).toHaveBeenCalledWith(AssetClass.equity, 20, 0);
      expect(result).toEqual({ total: 1, data: [sampleArticle] });
    });
  });

  describe('searchNews', () => {
    it('should call newsService.searchNews', async () => {
      const query = { q: 'Sonatel', limit: 10 };
      mockNewsService.searchNews.mockResolvedValue({ total: 1, data: [sampleArticle] });

      const result = await controller.searchNews(query);

      expect(mockNewsService.searchNews).toHaveBeenCalledWith(query);
      expect(result).toEqual({ total: 1, data: [sampleArticle] });
    });
  });

  describe('getEconomicCalendar', () => {
    it('should call newsService.getEconomicCalendar', async () => {
      mockNewsService.getEconomicCalendar.mockResolvedValue({ count: 1, data: [sampleEconomicEvent] });

      const result = await controller.getEconomicCalendar('this_week', 'CIV', EventImpact.high);

      expect(mockNewsService.getEconomicCalendar).toHaveBeenCalledWith('this_week', 'CIV', EventImpact.high);
      expect(result).toEqual({ count: 1, data: [sampleEconomicEvent] });
    });
  });

  describe('getEconomicEvents', () => {
    it('should call newsService.getEconomicEvents', async () => {
      const query = { country: 'CIV', limit: 20 };
      mockNewsService.getEconomicEvents.mockResolvedValue({ total: 1, data: [sampleEconomicEvent] });

      const result = await controller.getEconomicEvents(query);

      expect(mockNewsService.getEconomicEvents).toHaveBeenCalledWith(query);
      expect(result).toEqual({ total: 1, data: [sampleEconomicEvent] });
    });
  });

  describe('createEconomicEvent', () => {
    it('should call newsService.createEconomicEvent', async () => {
      const dto: CreateEconomicEventDto = {
        title: 'BCEAO',
        country: 'CIV',
        eventDate: new Date(),
        impact: EventImpact.high,
      };
      mockNewsService.createEconomicEvent.mockResolvedValue(sampleEconomicEvent);

      const result = await controller.createEconomicEvent(dto);

      expect(mockNewsService.createEconomicEvent).toHaveBeenCalledWith(dto);
      expect(result).toEqual(sampleEconomicEvent);
    });
  });

  describe('getPortfolioImpact', () => {
    it('should call newsService.getPortfolioImpact with user', async () => {
      const user = { id: 'user-1' };
      mockNewsService.getPortfolioImpact.mockResolvedValue({ impacted: true });

      const result = await controller.getPortfolioImpact(sampleArticle.id, user);

      expect(mockNewsService.getPortfolioImpact).toHaveBeenCalledWith(sampleArticle.id, user);
      expect(result).toEqual({ impacted: true });
    });
  });

  describe('findOne', () => {
    it('should call newsService.findOne with incrementViews boolean', async () => {
      mockNewsService.findOne.mockResolvedValue(sampleArticle);

      const result = await controller.findOne(sampleArticle.id, 'true');

      expect(mockNewsService.findOne).toHaveBeenCalledWith(sampleArticle.id, true);
      expect(result).toEqual(sampleArticle);
    });
  });

  describe('createArticle', () => {
    it('should call newsService.createArticle', async () => {
      const dto: CreateNewsArticleDto = {
        title: 'Titre',
        content: 'Contenu',
      };
      mockNewsService.createArticle.mockResolvedValue(sampleArticle);

      const result = await controller.createArticle(dto);

      expect(mockNewsService.createArticle).toHaveBeenCalledWith(dto);
      expect(result).toEqual(sampleArticle);
    });
  });

  describe('updateArticle', () => {
    it('should call newsService.updateArticle', async () => {
      const dto: UpdateNewsArticleDto = { title: 'Titre Modifié' };
      mockNewsService.updateArticle.mockResolvedValue({ ...sampleArticle, title: 'Titre Modifié' });

      const result = await controller.updateArticle(sampleArticle.id, dto);

      expect(mockNewsService.updateArticle).toHaveBeenCalledWith(sampleArticle.id, dto);
      expect(result.title).toBe('Titre Modifié');
    });
  });

  describe('deleteArticle', () => {
    it('should call newsService.deleteArticle', async () => {
      mockNewsService.deleteArticle.mockResolvedValue({ success: true });

      const result = await controller.deleteArticle(sampleArticle.id);

      expect(mockNewsService.deleteArticle).toHaveBeenCalledWith(sampleArticle.id);
      expect(result).toEqual({ success: true });
    });
  });
});
