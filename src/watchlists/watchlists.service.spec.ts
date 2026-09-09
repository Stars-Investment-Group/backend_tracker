import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistsService } from './watchlists.service';
import { DatabaseService } from '../database/database.service';

describe('WatchlistsService', () => {
  let service: WatchlistsService;

  const mockDatabaseService = {
    watchlist: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    watchlistInstrument: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<WatchlistsService>(WatchlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
