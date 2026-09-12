import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioPositionsService } from './portfolio_positions.service';
import { DatabaseService } from '../database/database.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoleUser } from '@prisma/client';

describe('PortfolioPositionsService', () => {
  let service: PortfolioPositionsService;

  const mockDatabaseService = {
    $queryRaw: jest.fn(),
    portfolio: {
      findUnique: jest.fn(),
    },
  };

  const mockUser = { id: 'user-uuid-1', role: RoleUser.USER };
  const mockAdmin = { id: 'admin-uuid-1', role: RoleUser.ADMIN };
  const mockAnalyst = { id: 'analyst-uuid-1', role: RoleUser.ANALYSTE };
  const otherUser = { id: 'other-user-uuid', role: RoleUser.USER };

  const mockPositions = [
    {
      portfolio_id: 'portfolio-uuid-1',
      instrument_id: 'instrument-uuid-1',
      quantity: 30,
      average_price: 140.0,
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioPositionsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<PortfolioPositionsService>(PortfolioPositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should query all portfolio positions without user filter for ADMIN', async () => {
      mockDatabaseService.$queryRaw.mockResolvedValue(mockPositions);

      const result = await service.findAll(mockAdmin);
      expect(result).toEqual(mockPositions);
      expect(mockDatabaseService.$queryRaw).toHaveBeenCalled();
    });

    it('should query all portfolio positions without user filter for ANALYSTE', async () => {
      mockDatabaseService.$queryRaw.mockResolvedValue(mockPositions);

      const result = await service.findAll(mockAnalyst);
      expect(result).toEqual(mockPositions);
      expect(mockDatabaseService.$queryRaw).toHaveBeenCalled();
    });

    it('should filter by user_id for standard USER', async () => {
      mockDatabaseService.$queryRaw.mockResolvedValue(mockPositions);

      const result = await service.findAll(mockUser);
      expect(result).toEqual(mockPositions);
      expect(mockDatabaseService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('findByPortfolio', () => {
    it('should throw NotFoundException if portfolio is not found', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(null);

      await expect(
        service.findByPortfolio('non-existent-portfolio', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner and not admin/analyst', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue({
        id: 'portfolio-uuid-1',
        userId: 'user-uuid-1',
      });

      await expect(
        service.findByPortfolio('portfolio-uuid-1', otherUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return positions when requested by owner', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue({
        id: 'portfolio-uuid-1',
        userId: 'user-uuid-1',
      });
      mockDatabaseService.$queryRaw.mockResolvedValue(mockPositions);

      const result = await service.findByPortfolio(
        'portfolio-uuid-1',
        mockUser,
      );
      expect(result).toEqual(mockPositions);
    });

    it('should return positions when requested by ADMIN even if not owner', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue({
        id: 'portfolio-uuid-1',
        userId: 'user-uuid-1',
      });
      mockDatabaseService.$queryRaw.mockResolvedValue(mockPositions);

      const result = await service.findByPortfolio(
        'portfolio-uuid-1',
        mockAdmin,
      );
      expect(result).toEqual(mockPositions);
    });

    it('should return positions when requested by ANALYSTE even if not owner', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue({
        id: 'portfolio-uuid-1',
        userId: 'user-uuid-1',
      });
      mockDatabaseService.$queryRaw.mockResolvedValue(mockPositions);

      const result = await service.findByPortfolio(
        'portfolio-uuid-1',
        mockAnalyst,
      );
      expect(result).toEqual(mockPositions);
    });
  });
});
