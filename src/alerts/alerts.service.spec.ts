import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { DatabaseService } from '../database/database.service';

describe('AlertsService', () => {
  let service: AlertsService;

  const mockDatabaseService = {
    alert: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    instrument: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
