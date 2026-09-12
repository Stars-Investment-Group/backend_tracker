import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { DatabaseService } from '../database/database.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoleUser } from '@prisma/client';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let databaseService: any;

  const mockUser = { id: 'user-uuid-1', role: RoleUser.USER };
  const mockAdmin = { id: 'admin-uuid-1', role: RoleUser.ADMIN };
  const mockAnalyst = { id: 'analyst-uuid-1', role: RoleUser.ANALYSTE };
  const otherUser = { id: 'other-user-uuid', role: RoleUser.USER };

  const mockPortfolio = {
    id: 'portfolio-uuid-1',
    name: 'Mon Portefeuille',
    description: 'Investissements Tech',
    currency: 'USD',
    userId: 'user-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-uuid-1',
      email: 'user@test.com',
      firstName: 'Jean',
      lastName: 'Dupont',
    },
    transactions: [],
  };

  const mockDatabaseService = {
    portfolio: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a portfolio with default currency USD when not specified', async () => {
      const dto = { name: 'Tech Portfolio', description: 'Tech stocks' };
      mockDatabaseService.portfolio.create.mockResolvedValue({
        id: 'new-id',
        ...dto,
        currency: 'USD',
        userId: mockUser.id,
      });

      const result = await service.create(dto as any, mockUser.id);
      expect(result).toBeDefined();
      expect(mockDatabaseService.portfolio.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          currency: 'USD',
          userId: mockUser.id,
        },
        include: expect.any(Object),
      });
    });

    it('should create a portfolio with specified currency EUR', async () => {
      const dto = { name: 'Euro Portfolio', currency: 'EUR' };
      mockDatabaseService.portfolio.create.mockResolvedValue({
        id: 'new-id-eur',
        ...dto,
        userId: mockUser.id,
      });

      const result = await service.create(dto, mockUser.id);
      expect(result).toBeDefined();
      expect(mockDatabaseService.portfolio.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: undefined,
          currency: 'EUR',
          userId: mockUser.id,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return only portfolios owned by the regular user', async () => {
      mockDatabaseService.portfolio.findMany.mockResolvedValue([mockPortfolio]);

      const result = await service.findAll(mockUser);
      expect(result).toEqual([mockPortfolio]);
      expect(mockDatabaseService.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return all portfolios when requested by ADMIN without filter', async () => {
      mockDatabaseService.portfolio.findMany.mockResolvedValue([mockPortfolio]);

      const result = await service.findAll(mockAdmin);
      expect(result).toEqual([mockPortfolio]);
      expect(mockDatabaseService.portfolio.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by requestedUserId when requested by ADMIN/ANALYSTE', async () => {
      mockDatabaseService.portfolio.findMany.mockResolvedValue([mockPortfolio]);

      const result = await service.findAll(mockAnalyst, 'target-user-id');
      expect(result).toEqual([mockPortfolio]);
      expect(mockDatabaseService.portfolio.findMany).toHaveBeenCalledWith({
        where: { userId: 'target-user-id' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return the portfolio if the requester is the owner', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const result = await service.findOne('portfolio-uuid-1', mockUser);
      expect(result).toEqual(mockPortfolio);
    });

    it('should return the portfolio if the requester is ADMIN', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const result = await service.findOne('portfolio-uuid-1', mockAdmin);
      expect(result).toEqual(mockPortfolio);
    });

    it('should return the portfolio if the requester is ANALYSTE', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const result = await service.findOne('portfolio-uuid-1', mockAnalyst);
      expect(result).toEqual(mockPortfolio);
    });

    it('should throw NotFoundException if portfolio does not exist', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the owner and not admin/analyst', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      await expect(
        service.findOne('portfolio-uuid-1', otherUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update portfolio if requester is the owner', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      const updateDto = { name: 'Portefeuille Modifié' };
      const updatedMock = { ...mockPortfolio, name: updateDto.name };
      mockDatabaseService.portfolio.update.mockResolvedValue(updatedMock);

      const result = await service.update(
        'portfolio-uuid-1',
        updateDto,
        mockUser,
      );
      expect(result).toEqual(updatedMock);
      expect(mockDatabaseService.portfolio.update).toHaveBeenCalledWith({
        where: { id: 'portfolio-uuid-1' },
        data: updateDto,
        include: expect.any(Object),
      });
    });

    it('should allow ADMIN to update any portfolio', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      const updateDto = { name: 'Admin Edited' };
      mockDatabaseService.portfolio.update.mockResolvedValue({
        ...mockPortfolio,
        ...updateDto,
      });

      const result = await service.update(
        'portfolio-uuid-1',
        updateDto,
        mockAdmin,
      );
      expect(result.name).toBe('Admin Edited');
    });

    it('should throw ForbiddenException if non-owner user tries to update', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      await expect(
        service.update('portfolio-uuid-1', { name: 'Hacked' }, otherUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete portfolio if requester is the owner', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      mockDatabaseService.portfolio.delete.mockResolvedValue(mockPortfolio);

      const result = await service.remove('portfolio-uuid-1', mockUser);
      expect(result).toEqual({
        success: true,
        message: 'Portfolio supprimé avec succès',
        portfolio: mockPortfolio,
      });
      expect(mockDatabaseService.portfolio.delete).toHaveBeenCalledWith({
        where: { id: 'portfolio-uuid-1' },
      });
    });

    it('should allow ADMIN to delete any portfolio', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      mockDatabaseService.portfolio.delete.mockResolvedValue(mockPortfolio);

      const result = await service.remove('portfolio-uuid-1', mockAdmin);
      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException if non-owner tries to delete', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      await expect(
        service.remove('portfolio-uuid-1', otherUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
