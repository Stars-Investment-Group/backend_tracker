jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => {},
  CronExpression: {
    EVERY_DAY_AT_6AM: '0 6 * * *',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { UemoaController } from './uemoa.controller';
import { UemoaService } from './uemoa.service';

describe('UemoaController', () => {
  let controller: UemoaController;
  let service: UemoaService;

  const mockUemoaService = {
    findIndicators: jest.fn(),
    listAvailableSeries: jest.fn(),
    syncAll: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UemoaController],
      providers: [
        {
          provide: UemoaService,
          useValue: mockUemoaService,
        },
      ],
    }).compile();

    controller = module.get<UemoaController>(UemoaController);
    service = module.get<UemoaService>(UemoaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findIndicators', () => {
    it('should call uemoaService.findIndicators with query', async () => {
      const mockResult = [{ id: '1', value: 600, period: '2024' }];
      mockUemoaService.findIndicators.mockResolvedValue(mockResult);

      const query = { country: 'SN', dataset: 'TC_A' };
      const result = await controller.findIndicators(query);

      expect(result).toEqual(mockResult);
      expect(mockUemoaService.findIndicators).toHaveBeenCalledWith(query);
    });
  });

  describe('listSeries', () => {
    it('should call uemoaService.listAvailableSeries', async () => {
      const mockSeries = [{ series_code: 'S1', series_name: 'PIB Sénégal' }];
      mockUemoaService.listAvailableSeries.mockResolvedValue(mockSeries);

      const result = await controller.listSeries();
      expect(result).toEqual(mockSeries);
      expect(mockUemoaService.listAvailableSeries).toHaveBeenCalled();
    });
  });

  describe('triggerSync', () => {
    it('should trigger manual sync and return success message', async () => {
      mockUemoaService.syncAll.mockResolvedValue(undefined);

      const result = await controller.triggerSync();
      expect(result).toEqual({ message: 'Synchronisation UEMOA terminée.' });
      expect(mockUemoaService.syncAll).toHaveBeenCalled();
    });
  });
});
