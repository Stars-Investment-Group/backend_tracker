import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistsController } from './watchlists.controller';
import { WatchlistsService } from './watchlists.service';
import { DatabaseService } from '../database/database.service';

describe('WatchlistsController', () => {
  let controller: WatchlistsController;

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
      controllers: [WatchlistsController],
      providers: [
        WatchlistsService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    controller = module.get<WatchlistsController>(WatchlistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
