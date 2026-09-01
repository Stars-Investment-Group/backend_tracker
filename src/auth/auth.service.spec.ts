import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { AuditService } from '../audit/audit.service';
import { RoleUser } from '@prisma/client';
import { ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: any;
  let jwtService: any;
  let auditService: any;

  const mockDatabaseService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get(DatabaseService);
    jwtService = module.get(JwtService);
    auditService = module.get(AuditService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('devrait créer un utilisateur et retourner des tokens', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue(null);
      mockDatabaseService.user.create.mockResolvedValue({
        id: 'user-uuid',
        email: 'test@example.com',
        role: RoleUser.USER,
        passwordHash: 'hashed',
        refreshTokenHash: null,
      });
      mockDatabaseService.user.update.mockResolvedValue({});

      const result = await service.register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(mockDatabaseService.user.create).toHaveBeenCalled();
    });

    it('devrait lever ConflictException si email existe déjà', async () => {
      mockDatabaseService.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('devrait authentifier avec succès un utilisateur valide', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      mockDatabaseService.user.findUnique.mockResolvedValue({
        id: 'user-uuid',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: RoleUser.USER,
        isActive: true,
      });
      mockDatabaseService.user.update.mockResolvedValue({});

      const result = await service.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe('mock-token');
    });

    it('devrait rejeter si mot de passe incorrect', async () => {
      const hashedPassword = await bcrypt.hash('OtherPassword', 10);
      mockDatabaseService.user.findUnique.mockResolvedValue({
        id: 'user-uuid',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: RoleUser.USER,
        isActive: true,
      });

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
