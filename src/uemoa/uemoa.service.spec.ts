jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => {},
  CronExpression: {
    EVERY_DAY_AT_6AM: '0 6 * * *',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { UemoaService } from './uemoa.service';
import { DatabaseService } from '../database/database.service';
import { of } from 'rxjs';

describe('UemoaService', () => {
  let service: UemoaService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockDatabaseService = {
    economicIndicator: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UemoaService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UemoaService>(UemoaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformSeries', () => {
    it('should transform raw DBnomics response into structured indicators', () => {
      const raw = {
        series: {
          docs: [
            {
              provider_code: 'BCEAO',
              dataset_code: 'PIBN',
              series_code: 'KKKSR1015A0BP',
              series_name: 'SENEGAL - PIB nominal',
              period: ['2022', '2023', '2024'],
              value: [15000, 16200, 17500],
            },
          ],
        },
      };

      const result = service.transformSeries(raw, 'SN');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        provider: 'BCEAO',
        dataset: 'PIBN',
        seriesCode: 'KKKSR1015A0BP',
        seriesName: 'SENEGAL - PIB nominal',
        country: 'SN',
        period: '2022',
        value: 15000,
      });
    });

    it('should return empty array if docs is empty', () => {
      const result = service.transformSeries({ series: { docs: [] } });
      expect(result).toEqual([]);
    });
  });

  describe('saveIndicators', () => {
    it('should upsert each row in database and return count', async () => {
      mockDatabaseService.economicIndicator.upsert.mockResolvedValue({});

      const rows = [
        {
          provider: 'BCEAO',
          dataset: 'TC_A',
          seriesCode: 'S1',
          seriesName: 'USD',
          country: null,
          period: '2024',
          value: 605.5,
        },
      ];

      const count = await service.saveIndicators(rows);
      expect(count).toBe(1);
      expect(
        mockDatabaseService.economicIndicator.upsert,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('findIndicators', () => {
    it('should query with filters', async () => {
      mockDatabaseService.economicIndicator.findMany.mockResolvedValue([]);

      const result = await service.findIndicators({
        country: 'SN',
        dataset: 'PIBN',
      });
      expect(result).toEqual([]);
      expect(
        mockDatabaseService.economicIndicator.findMany,
      ).toHaveBeenCalledWith({
        where: { country: 'SN', dataset: 'PIBN' },
        orderBy: [{ seriesCode: 'asc' }, { period: 'asc' }],
      });
    });
  });

  describe('listAvailableSeries', () => {
    it('should return distinct series', async () => {
      const mockDistinct = [
        {
          provider: 'BCEAO',
          dataset: 'PIBN',
          seriesCode: 'S1',
          seriesName: 'PIB SN',
          country: 'SN',
          fetchedAt: new Date(),
        },
      ];
      mockDatabaseService.economicIndicator.findMany.mockResolvedValue(
        mockDistinct,
      );

      const result = await service.listAvailableSeries();
      expect(result).toEqual(mockDistinct);
      expect(
        mockDatabaseService.economicIndicator.findMany,
      ).toHaveBeenCalledWith({
        distinct: ['provider', 'dataset', 'seriesCode'],
        select: expect.any(Object),
        orderBy: { seriesCode: 'asc' },
      });
    });
  });

  describe('syncSeries & syncAll', () => {
    it('should fetch, transform and save series', async () => {
      const raw = {
        series: {
          docs: [
            {
              provider_code: 'BCEAO',
              dataset_code: 'TC_A',
              series_code: 'ZZZSF3100A0GP',
              series_name: 'USD Rate',
              period: ['2024'],
              value: [605],
            },
          ],
        },
      };
      mockHttpService.get.mockReturnValue(of({ data: raw }));
      mockDatabaseService.economicIndicator.upsert.mockResolvedValue({});

      const count = await service.syncSeries(
        'BCEAO',
        'TC_A',
        'ZZZSF3100A0GP',
        null,
      );
      expect(count).toBe(1);
    });

    it('should run syncAll without throwing if an item fails', async () => {
      mockHttpService.get.mockImplementation(() => {
        throw new Error('Network error');
      });

      await expect(service.syncAll()).resolves.not.toThrow();
    });
  });
});
