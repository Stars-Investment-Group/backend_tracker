import { Test, TestingModule } from '@nestjs/testing';
import { InstrumentService } from './instrument.service';
import { DatabaseService } from '../database/database.service';

describe('InstrumentService', () => {
  let service: InstrumentService;
  let databaseService: any;

  const mockDatabaseService = {
    instrument: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstrumentService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<InstrumentService>(InstrumentService);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
