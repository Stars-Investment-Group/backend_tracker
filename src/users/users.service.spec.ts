import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RoleUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let databaseService: any;
  let auditService: any;

  const mockUserDb = {
    id: 'user-uuid-1',
    email: 'test@stars-group.com',
    passwordHash: 'hashed_password_123',
    refreshTokenHash: null,
    firstName: 'Alexandre',
    lastName: 'Bash',
    company: 'Stars',
    role: RoleUser.USER,
    isActive: true,
    theme: 'dark',
    preferences: {},
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    portfolios: [],
  };

  const mockDatabaseService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    databaseService = module.get(DatabaseService);
    auditService = module.get(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      email: 'Test@Stars-Group.com',
      passwordHash: 'SecretPassword123!',
      firstName: 'Alexandre',
      lastName: 'Bash',
    };

    it('should throw ConflictException if email is already taken', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUserDb);

      await expect(service.create(createDto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should create user, hash password and create audit log', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      mockDatabaseService.user.create.mockResolvedValue(mockUserDb);

      const result = await service.create(
        createDto as any,
        'admin-id',
        '127.0.0.1',
        'JestTest',
      );

      expect(result).toBeDefined();
      expect(result.email).toBe('test@stars-group.com');
      expect((result as any).passwordHash).toBeUndefined();
      expect(mockDatabaseService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@stars-group.com',
          passwordHash: 'hashed_password_123',
          firstName: createDto.firstName,
          lastName: createDto.lastName,
          company: undefined,
          theme: 'dark',
          role: RoleUser.USER,
        },
      });
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_CREATED',
          entityType: 'User',
          entityId: mockUserDb.id,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return list of users without password hashes', async () => {
      mockDatabaseService.user.findMany.mockResolvedValue([mockUserDb]);

      const result = await service.findAll();
      expect(result).toEqual([mockUserDb]);
      expect(mockDatabaseService.user.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({
          id: true,
          email: true,
          role: true,
        }),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return user without passwordHash', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUserDb);

      const result = await service.findOne('user-uuid-1');
      expect(result.id).toBe(mockUserDb.id);
      expect((result as any).passwordHash).toBeUndefined();
      expect((result as any).refreshTokenHash).toBeUndefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user and log audit', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUserDb);
      const updateDto = { firstName: 'Alex' };
      mockDatabaseService.user.update.mockResolvedValue({
        ...mockUserDb,
        firstName: 'Alex',
      });

      const result = await service.update('user-uuid-1', updateDto);
      expect(result.firstName).toBe('Alex');
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_UPDATED',
        }),
      );
    });

    it('should throw NotFoundException when updating non-existent user', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { firstName: 'Alex' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRole', () => {
    it('should update user role and log audit', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUserDb);
      mockDatabaseService.user.update.mockResolvedValue({
        id: mockUserDb.id,
        email: mockUserDb.email,
        role: RoleUser.ANALYSTE,
        updatedAt: new Date(),
      });

      const result = await service.updateRole(
        'user-uuid-1',
        RoleUser.ANALYSTE,
        'admin-id',
      );
      expect(result.success).toBe(true);
      expect(result.user.role).toBe(RoleUser.ANALYSTE);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_ROLE_UPDATED',
          userId: 'admin-id',
        }),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateRole('invalid-id', RoleUser.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete user and log audit', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(mockUserDb);
      mockDatabaseService.user.delete.mockResolvedValue(mockUserDb);

      const result = await service.remove('user-uuid-1', 'admin-id');
      expect(result).toBeDefined();
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'USER_DELETED',
        }),
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
