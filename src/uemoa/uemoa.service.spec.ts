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
});
