import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { DatabaseService } from '../database/database.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AlertType } from '@prisma/client';

describe('AlertsService', () => {
  let service: AlertsService;

  const mockAlert = {
    id: 'alert-uuid-1',
    userId: 'user-uuid-1',
    instrumentId: 'instrument-uuid-1',
    alertType: 'price' as AlertType,
    condition: { operator: 'gt', value: 200 },
    isActive: true,
    triggeredAt: null,
    createdAt: new Date(),
  };

  const mockInstrument = {
    id: 'instrument-uuid-1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
  };

  const mockDatabaseService = {
    alert: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    instrument: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an alert when instrument is valid', async () => {
      mockDatabaseService.instrument.findUnique.mockResolvedValue(
        mockInstrument,
      );
      mockDatabaseService.alert.create.mockResolvedValue(mockAlert);

      const result = await service.create(
        {
          instrumentId: 'instrument-uuid-1',
          alertType: 'price',
          condition: { operator: 'gt', value: 200 },
        },
        'user-uuid-1',
      );

      expect(result).toEqual(mockAlert);
    });

    it('should throw NotFoundException if instrumentId is provided but not found', async () => {
      mockDatabaseService.instrument.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          {
            instrumentId: 'invalid-instrument',
            alertType: 'price',
            condition: {},
          },
          'user-uuid-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a macro/news alert without instrumentId', async () => {
      const macroAlert = {
        ...mockAlert,
        instrumentId: null,
        alertType: 'economic' as AlertType,
      };
      mockDatabaseService.alert.create.mockResolvedValue(macroAlert);

      const result = await service.create(
        { alertType: 'economic', condition: {} },
        'user-uuid-1',
      );
      expect(result.instrumentId).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return user alerts', async () => {
      mockDatabaseService.alert.findMany.mockResolvedValue([mockAlert]);

      const result = await service.findAll('user-uuid-1');
      expect(result).toEqual([mockAlert]);
      expect(mockDatabaseService.alert.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        include: { instrument: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return alert for owner', async () => {
      mockDatabaseService.alert.findUnique.mockResolvedValue(mockAlert);

      const result = await service.findOne('user-uuid-1', 'alert-uuid-1');
      expect(result).toEqual(mockAlert);
    });

    it('should throw NotFoundException if alert not found', async () => {
      mockDatabaseService.alert.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('user-uuid-1', 'invalid-alert'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockDatabaseService.alert.findUnique.mockResolvedValue(mockAlert);

      await expect(
        service.findOne('other-user', 'alert-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update alert for owner', async () => {
      mockDatabaseService.alert.findUnique.mockResolvedValue(mockAlert);
      mockDatabaseService.alert.update.mockResolvedValue({
        ...mockAlert,
        isActive: false,
      });

      const result = await service.update('user-uuid-1', 'alert-uuid-1', {
        isActive: false,
      });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundException if updated instrument does not exist', async () => {
      mockDatabaseService.alert.findUnique.mockResolvedValue(mockAlert);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-uuid-1', 'alert-uuid-1', {
          instrumentId: 'non-existent',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete alert for owner', async () => {
      mockDatabaseService.alert.findUnique.mockResolvedValue(mockAlert);
      mockDatabaseService.alert.delete.mockResolvedValue(mockAlert);

      const result = await service.remove('user-uuid-1', 'alert-uuid-1');
      expect(result.success).toBe(true);
    });
  });
});
