import { Test, TestingModule } from '@nestjs/testing';
import { PriceHistoryController } from './price_history.controller';
import { PriceHistoryService } from './price_history.service';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { QueryPriceHistoryDto } from './dto/query-price-history.dto';

describe('PriceHistoryController', () => {
  let controller: PriceHistoryController;
  let service: PriceHistoryService;

  const mockPriceHistoryService = {
    create: jest.fn(),
    bulkCreate: jest.fn(),
    findByInstrument: jest.fn(),
    findByTicker: jest.fn(),
    getLatestPrice: jest.fn(),
    remove: jest.fn(),
  };

  const sampleQuote = {
    id: '22222222-2222-2222-2222-222222222222',
    instrumentId: '11111111-1111-1111-1111-111111111111',
    timestamp: new Date('2026-09-01T16:00:00.000Z'),
    close: 187.75,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceHistoryController],
      providers: [
        {
          provide: PriceHistoryService,
          useValue: mockPriceHistoryService,
        },
      ],
    }).compile();

    controller = module.get<PriceHistoryController>(PriceHistoryController);
    service = module.get<PriceHistoryService>(PriceHistoryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to service.create', async () => {
      const dto: CreatePriceHistoryDto = {
        instrumentId: '11111111-1111-1111-1111-111111111111',
        timestamp: '2026-09-01T16:00:00.000Z',
        close: 187.75,
      };

      mockPriceHistoryService.create.mockResolvedValue(sampleQuote);

      const result = await controller.create(dto);

      expect(mockPriceHistoryService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(sampleQuote);
    });
  });

  describe('bulkCreate', () => {
    it('should delegate to service.bulkCreate', async () => {
      const dto = {
        prices: [
          {
            instrumentId: '11111111-1111-1111-1111-111111111111',
            timestamp: '2026-09-01T16:00:00.000Z',
            close: 187.75,
          },
        ],
      };

      const expectedResponse = { success: true, message: '1 cotations enregistrées avec succès', count: 1 };
      mockPriceHistoryService.bulkCreate.mockResolvedValue(expectedResponse);

      const result = await controller.bulkCreate(dto);

      expect(mockPriceHistoryService.bulkCreate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findByInstrument', () => {
    it('should delegate to service.findByInstrument', async () => {
      const query: QueryPriceHistoryDto = { limit: 10 };
      const expectedResponse = { total: 1, limit: 10, offset: 0, data: [sampleQuote] };

      mockPriceHistoryService.findByInstrument.mockResolvedValue(expectedResponse);

      const result = await controller.findByInstrument(sampleQuote.instrumentId, query);

      expect(mockPriceHistoryService.findByInstrument).toHaveBeenCalledWith(
        sampleQuote.instrumentId,
        query,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findByTicker', () => {
    it('should delegate to service.findByTicker', async () => {
      const query: QueryPriceHistoryDto = { limit: 10 };
      const expectedResponse = { total: 1, limit: 10, offset: 0, data: [sampleQuote] };

      mockPriceHistoryService.findByTicker.mockResolvedValue(expectedResponse);

      const result = await controller.findByTicker('AAPL', query);

      expect(mockPriceHistoryService.findByTicker).toHaveBeenCalledWith('AAPL', query);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getLatestPrice', () => {
    it('should delegate to service.getLatestPrice', async () => {
      mockPriceHistoryService.getLatestPrice.mockResolvedValue(sampleQuote);

      const result = await controller.getLatestPrice(sampleQuote.instrumentId);

      expect(mockPriceHistoryService.getLatestPrice).toHaveBeenCalledWith(sampleQuote.instrumentId);
      expect(result).toEqual(sampleQuote);
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove', async () => {
      const expectedResponse = { success: true, message: 'Cotation supprimée avec succès' };
      mockPriceHistoryService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(sampleQuote.id);

      expect(mockPriceHistoryService.remove).toHaveBeenCalledWith(sampleQuote.id);
      expect(result).toEqual(expectedResponse);
    });
  });
});
