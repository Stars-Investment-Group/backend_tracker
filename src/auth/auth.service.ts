import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RoleUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existing = await this.databaseService.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(`L'adresse email "${dto.email}" est déjà utilisée`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.databaseService.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        company: dto.company,
        theme: dto.theme ?? 'dark',
        role: RoleUser.USER,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    await this.auditService.log({
      userId: user.id,
      action: 'USER_REGISTER',
      entityType: 'User',
      entityId: user.id,
      newValues: { email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      ipAddress,
      userAgent,
    });

    const { passwordHash: _, refreshTokenHash: __, ...userResponse } = user;
    return {
      success: true,
      message: 'Inscription réussie',
      user: userResponse,
      ...tokens,
    };
  }

  /**
   * Connexion utilisateur
   */
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Votre compte a été désactivé. Veuillez contacter un administrateur.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    await this.databaseService.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    const { passwordHash: _, refreshTokenHash: __, ...userResponse } = user;
    return {
      success: true,
      message: 'Connexion réussie',
      user: userResponse,
      ...tokens,
    };
  }

  /**
   * Renouvellement des tokens (Refresh Token Rotation)
   */
  async refreshTokens(userId: string, refreshToken: string, ipAddress?: string, userAgent?: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Accès refusé. Session invalide.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Compte désactivé.');
    }

    const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isRefreshTokenValid) {
      // Possible tentative de rejeu / vol de token : on révoque immédiatement le refresh token
      await this.databaseService.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });
      await this.auditService.log({
        userId,
        action: 'SECURITY_TOKEN_REUSE_DETECTED',
        entityType: 'User',
        entityId: userId,
        ipAddress,
        userAgent,
      });
      throw new ForbiddenException('Token de rafraîchissement invalide. Reconnexion requise.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    await this.auditService.log({
      userId: user.id,
      action: 'TOKEN_REFRESH',
      entityType: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return tokens;
  }

  /**
   * Déconnexion sécurisée (invalidation du refresh token)
   */
  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    await this.databaseService.user.updateMany({
      where: { id: userId, refreshTokenHash: { not: null } },
      data: { refreshTokenHash: null },
    });

    await this.auditService.log({
      userId,
      action: 'USER_LOGOUT',
      entityType: 'User',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Déconnexion réussie',
    };
  }

  /**
   * Génération de la paire de tokens
   */
  private async generateTokens(userId: string, email: string, role: RoleUser) {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const secret = process.env.JWT_SECRET || 'secret-fallback-key';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || secret + '-refresh';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
    };
  }

  /**
   * Stocke le hash du refresh token en base
   */
  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(refreshToken, salt);

    await this.databaseService.user.update({
      where: { id: userId },
      data: { refreshTokenHash: hash },
    });
  }
}
