import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { DatabaseService } from '../database/database.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let databaseService: any;

  const mockDatabaseService = {
    portfolio: { findUnique: jest.fn() },
    instrument: { findUnique: jest.fn() },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
