import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RoleUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly auditService: AuditService,
  ) {}

  async login(loginUserDto: LoginUserDto, ipAddress?: string, userAgent?: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email: loginUserDto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte utilisateur désactivé');
    }

    const isPasswordValid = await bcrypt.compare(loginUserDto.passwordHash, user.passwordHash);
    if (!isPasswordValid) {
      throw new NotFoundException('Email ou mot de passe incorrect');
    }

    const updatedUser = await this.databaseService.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    const token = jwt.sign(
      { sub: updatedUser.id, id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
      process.env.JWT_SECRET || 'secret-fallback-key',
      { expiresIn: '24h' },
    );

    await this.auditService.log({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    const { passwordHash, refreshTokenHash, ...userWithoutPassword } = updatedUser;

    return {
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword,
      token,
    };
  }

  async create(createUserDto: CreateUserDto, actorId?: string, ipAddress?: string, userAgent?: string) {
    const existingUser = await this.databaseService.user.findUnique({
      where: { email: createUserDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(`L'email ${createUserDto.email} est déjà utilisé.`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.passwordHash, 10);

    const user = await this.databaseService.user.create({
      data: {
        email: createUserDto.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        company: createUserDto.company,
        theme: createUserDto.theme ?? 'dark',
        role: createUserDto.role ?? RoleUser.USER,
      },
    });

    await this.auditService.log({
      userId: actorId ?? user.id,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      newValues: { email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      ipAddress,
      userAgent,
    });

    const { passwordHash, refreshTokenHash, ...result } = user;
    return result;
  }

  async findAll() {
    return this.databaseService.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        preferences: true,
        theme: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      include: {
        portfolios: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    const { passwordHash, refreshTokenHash, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto, actorId?: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.databaseService.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    const data: any = { ...updateUserDto };
    if (updateUserDto.passwordHash) {
      data.passwordHash = await bcrypt.hash(updateUserDto.passwordHash, 10);
    }
    if (updateUserDto.email) {
      data.email = updateUserDto.email.toLowerCase();
    }

    const updated = await this.databaseService.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        company: true,
        preferences: true,
        theme: true,
        isActive: true,
        updatedAt: true,
      },
    });

    await this.auditService.log({
      userId: actorId ?? id,
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: id,
      oldValues: { email: existing.email, role: existing.role, isActive: existing.isActive },
      newValues: { email: updated.email, role: updated.role, isActive: updated.isActive },
      ipAddress,
      userAgent,
    });

    return updated;
  }

  async updateRole(id: string, role: RoleUser, actorId?: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.databaseService.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    const updated = await this.databaseService.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'USER_ROLE_UPDATED',
      entityType: 'User',
      entityId: id,
      oldValues: { role: existing.role },
      newValues: { role: updated.role },
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: `Rôle mis à jour vers ${role}`,
      user: updated,
    };
  }

  async remove(id: string, actorId?: string, ipAddress?: string, userAgent?: string) {
    const existing = await this.databaseService.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé.`);
    }

    const deleted = await this.databaseService.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        preferences: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.auditService.log({
      userId: actorId ?? id,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: id,
      oldValues: { email: existing.email, role: existing.role },
      ipAddress,
      userAgent,
    });

    return deleted;
  }
}

export default UsersService;
