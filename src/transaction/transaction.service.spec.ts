import { Test, TestingModule } from '@nestjs/testing';
import { TransactionService } from './transaction.service';
import { DatabaseService } from '../database/database.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RoleUser, TransactionType } from '@prisma/client';

describe('TransactionService', () => {
  let service: TransactionService;
  let databaseService: any;

  const mockUser = { id: 'user-uuid-1', role: RoleUser.USER };
  const mockAdmin = { id: 'admin-uuid-1', role: RoleUser.ADMIN };
  const mockAnalyst = { id: 'analyst-uuid-1', role: RoleUser.ANALYSTE };
  const otherUser = { id: 'other-user-uuid', role: RoleUser.USER };

  const mockPortfolio = {
    id: 'portfolio-uuid-1',
    name: 'Tech Growth',
    userId: 'user-uuid-1',
  };

  const mockInstrument = {
    id: 'instrument-uuid-1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    assetClass: 'equity',
  };

  const mockTransaction = {
    id: 'tx-uuid-1',
    portfolioId: 'portfolio-uuid-1',
    instrumentId: 'instrument-uuid-1',
    transactionType: 'buy' as TransactionType,
    quantity: 10,
    price: 150,
    fees: 5,
    transactionDate: new Date('2026-09-01'),
    notes: 'Initial buy',
    portfolio: mockPortfolio,
    instrument: mockInstrument,
  };

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
    jest.clearAllMocks();

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

  describe('create', () => {
    const validBuyDto = {
      portfolioId: 'portfolio-uuid-1',
      instrumentId: 'instrument-uuid-1',
      transactionType: 'buy' as TransactionType,
      quantity: 10,
      price: 150,
      fees: 2,
      transactionDate: '2026-09-10T10:00:00.000Z',
      notes: 'Buy AAPL',
    };

    it('should create a BUY transaction successfully', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(
        mockInstrument,
      );
      mockDatabaseService.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create(validBuyDto, mockUser);
      expect(result.success).toBe(true);
      expect(result.transaction).toEqual(mockTransaction);
      expect(mockDatabaseService.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          portfolioId: validBuyDto.portfolioId,
          instrumentId: validBuyDto.instrumentId,
          transactionType: 'buy',
          quantity: 10,
          price: 150,
          fees: 2,
        }),
        include: {
          portfolio: true,
          instrument: true,
        },
      });
    });

    it('should throw NotFoundException if portfolio is not found', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(null);

      await expect(
        service.create(validBuyDto as any, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own portfolio and is not admin', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      await expect(
        service.create(validBuyDto as any, otherUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if instrument is not found', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(null);

      await expect(
        service.create(validBuyDto as any, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if quantity <= 0', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(
        mockInstrument,
      );

      await expect(
        service.create({ ...validBuyDto, quantity: 0 } as any, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if price < 0', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(
        mockInstrument,
      );

      await expect(
        service.create({ ...validBuyDto, price: -5 } as any, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when selling more than current holdings', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(
        mockInstrument,
      );
      // Current holdings: 10 bought, 5 sold = 5 available
      mockDatabaseService.transaction.findMany.mockResolvedValue([
        { transactionType: 'buy', quantity: 10 },
        { transactionType: 'sell', quantity: 5 },
      ]);

      const sellDto = {
        ...validBuyDto,
        transactionType: 'sell' as TransactionType,
        quantity: 10, // Requesting 10 when only 5 available
      };

      await expect(service.create(sellDto as any, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow SELL when holdings are sufficient', async () => {
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(mockPortfolio);
      mockDatabaseService.instrument.findUnique.mockResolvedValue(
        mockInstrument,
      );
      mockDatabaseService.transaction.findMany.mockResolvedValue([
        { transactionType: 'buy', quantity: 20 },
      ]);
      mockDatabaseService.transaction.create.mockResolvedValue({
        ...mockTransaction,
        transactionType: 'sell',
        quantity: 10,
      });

      const sellDto = {
        ...validBuyDto,
        transactionType: 'sell' as TransactionType,
        quantity: 10,
      };

      const result = await service.create(sellDto, mockUser);
      expect(result.success).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return transactions for user portfolios', async () => {
      mockDatabaseService.transaction.findMany.mockResolvedValue([
        mockTransaction,
      ]);

      const result = await service.findAll(mockUser);
      expect(result).toEqual([mockTransaction]);
      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          portfolio: { userId: mockUser.id },
        },
        include: { instrument: true, portfolio: true },
        orderBy: { transactionDate: 'desc' },
      });
    });

    it('should return all transactions when queried by ADMIN', async () => {
      mockDatabaseService.transaction.findMany.mockResolvedValue([
        mockTransaction,
      ]);

      const result = await service.findAll(mockAdmin);
      expect(result).toEqual([mockTransaction]);
      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { instrument: true, portfolio: true },
        orderBy: { transactionDate: 'desc' },
      });
    });

    it('should filter by portfolioId when specified', async () => {
      mockDatabaseService.transaction.findMany.mockResolvedValue([
        mockTransaction,
      ]);

      const result = await service.findAll(mockUser, 'portfolio-uuid-1');
      expect(result).toEqual([mockTransaction]);
      expect(mockDatabaseService.transaction.findMany).toHaveBeenCalledWith({
        where: {
          portfolio: { userId: mockUser.id },
          portfolioId: 'portfolio-uuid-1',
        },
        include: { instrument: true, portfolio: true },
        orderBy: { transactionDate: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return transaction when user is owner of portfolio', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      const result = await service.findOne('tx-uuid-1', mockUser);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-tx', mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner and not admin/analyste', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      await expect(service.findOne('tx-uuid-1', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update transaction successfully by owner', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );
      const updateDto = { notes: 'Updated notes', quantity: 15 };
      mockDatabaseService.transaction.update.mockResolvedValue({
        ...mockTransaction,
        ...updateDto,
      });

      const result = await service.update('tx-uuid-1', updateDto, mockUser);
      expect(result.success).toBe(true);
      expect(result.transaction.quantity).toBe(15);
    });

    it('should throw BadRequestException if update quantity <= 0', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      await expect(
        service.update('tx-uuid-1', { quantity: 0 } as any, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if update price < 0', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      await expect(
        service.update('tx-uuid-1', { price: -10 } as any, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if new destination portfolio does not exist', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );
      mockDatabaseService.portfolio.findUnique.mockResolvedValue(null);

      await expect(
        service.update(
          'tx-uuid-1',
          { portfolioId: 'non-existent-portfolio' } as any,
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if new destination portfolio is not owned by user', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );
      mockDatabaseService.portfolio.findUnique.mockResolvedValue({
        id: 'other-p',
        userId: 'someone-else',
      });

      await expect(
        service.update(
          'tx-uuid-1',
          { portfolioId: 'other-p' } as any,
          mockUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if new instrument does not exist', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );
      mockDatabaseService.instrument.findUnique.mockResolvedValue(null);

      await expect(
        service.update(
          'tx-uuid-1',
          { instrumentId: 'non-existent-inst' } as any,
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete transaction by owner', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );
      mockDatabaseService.transaction.delete.mockResolvedValue(mockTransaction);

      const result = await service.remove('tx-uuid-1', mockUser);
      expect(result.success).toBe(true);
      expect(mockDatabaseService.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-uuid-1' },
      });
    });

    it('should throw ForbiddenException if non-owner tries to delete', async () => {
      mockDatabaseService.transaction.findUnique.mockResolvedValue(
        mockTransaction,
      );

      await expect(service.remove('tx-uuid-1', otherUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
