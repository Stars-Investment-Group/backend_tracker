import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistsController } from './watchlists.controller';
import { WatchlistsService } from './watchlists.service';

describe('WatchlistsController', () => {
  let controller: WatchlistsController;

  const mockWatchlistsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addInstrument: jest.fn(),
    getInstruments: jest.fn(),
    removeInstrument: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistsController],
      providers: [
        {
          provide: WatchlistsService,
          useValue: mockWatchlistsService,
        },
      ],
    }).compile();

    controller = module.get<WatchlistsController>(WatchlistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
