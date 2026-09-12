import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistsService } from './watchlists.service';
import { DatabaseService } from '../database/database.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

describe('WatchlistsService', () => {
  let service: WatchlistsService;

  const mockWatchlist = {
    id: 'watchlist-uuid-1',
    userId: 'user-uuid-1',
    name: 'Tech US',
    isActive: true,
    instruments: [],
    createdAt: new Date(),
  };

  const mockInstrument = {
    id: 'instrument-uuid-1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
  };

  const mockDatabaseService = {
    watchlist: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    watchlistInstrument: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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
        WatchlistsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<WatchlistsService>(WatchlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a watchlist for the user', async () => {
      mockDatabaseService.watchlist.create.mockResolvedValue(mockWatchlist);

      const result = await service.create({ name: 'Tech US' }, 'user-uuid-1');
      expect(result).toEqual(mockWatchlist);
      expect(mockDatabaseService.watchlist.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-uuid-1',
          name: 'Tech US',
          isActive: true,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all watchlists belonging to user', async () => {
      mockDatabaseService.watchlist.findMany.mockResolvedValue([mockWatchlist]);

      const result = await service.findAll('user-uuid-1');
      expect(result).toEqual([mockWatchlist]);
      expect(mockDatabaseService.watchlist.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
        include: {
          instruments: {
            include: { instrument: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return watchlist if requested by owner', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);

      const result = await service.findOne('user-uuid-1', 'watchlist-uuid-1');
      expect(result).toEqual(mockWatchlist);
    });

    it('should throw NotFoundException if watchlist does not exist', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('user-uuid-1', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);

      await expect(
        service.findOne('other-user', 'watchlist-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update watchlist for owner', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);
      mockDatabaseService.watchlist.update.mockResolvedValue({
        ...mockWatchlist,
        name: 'New Name',
      });

      const result = await service.update('user-uuid-1', 'watchlist-uuid-1', {
        name: 'New Name',
      });
      expect(result.name).toBe('New Name');
    });
  });

  describe('remove', () => {
    it('should delete watchlist for owner', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);
      mockDatabaseService.watchlist.delete.mockResolvedValue(mockWatchlist);

      const result = await service.remove('user-uuid-1', 'watchlist-uuid-1');
      expect(result.success).toBe(true);
    });
  });

  describe('addInstrument', () => {
    it('should add instrument to watchlist', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(
        mockInstrument,
      );
      mockDatabaseService.watchlistInstrument.findUnique.mockResolvedValue(
        null,
      );
      mockDatabaseService.watchlistInstrument.create.mockResolvedValue({
        watchlistId: 'watchlist-uuid-1',
        instrumentId: 'instrument-uuid-1',
        instrument: mockInstrument,
      });

      const result = await service.addInstrument(
        'user-uuid-1',
        'watchlist-uuid-1',
        'instrument-uuid-1',
      );
      expect(result.instrument).toEqual(mockInstrument);
    });

    it('should throw NotFoundException if instrument does not exist', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(null);

      await expect(
        service.addInstrument(
          'user-uuid-1',
          'watchlist-uuid-1',
          'invalid-instrument',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if instrument already in watchlist', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(
        mockInstrument,
      );
      mockDatabaseService.watchlistInstrument.findUnique.mockResolvedValue({
        watchlistId: 'watchlist-uuid-1',
        instrumentId: 'instrument-uuid-1',
      });

      await expect(
        service.addInstrument(
          'user-uuid-1',
          'watchlist-uuid-1',
          'instrument-uuid-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getInstruments', () => {
    it('should return list of instruments in watchlist', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);
      mockDatabaseService.watchlistInstrument.findMany.mockResolvedValue([
        { instrument: mockInstrument },
      ]);

      const result = await service.getInstruments(
        'user-uuid-1',
        'watchlist-uuid-1',
      );
      expect(result).toEqual([mockInstrument]);
    });
  });

  describe('removeInstrument', () => {
    it('should remove instrument from watchlist', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);
      mockDatabaseService.watchlistInstrument.findUnique.mockResolvedValue({
        watchlistId: 'watchlist-uuid-1',
        instrumentId: 'instrument-uuid-1',
      });
      mockDatabaseService.watchlistInstrument.delete.mockResolvedValue({});

      const result = await service.removeInstrument(
        'user-uuid-1',
        'watchlist-uuid-1',
        'instrument-uuid-1',
      );
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if instrument is not in watchlist', async () => {
      mockDatabaseService.watchlist.findUnique.mockResolvedValue(mockWatchlist);
      mockDatabaseService.watchlistInstrument.findUnique.mockResolvedValue(
        null,
      );

      await expect(
        service.removeInstrument(
          'user-uuid-1',
          'watchlist-uuid-1',
          'instrument-uuid-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
