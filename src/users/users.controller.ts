import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RoleUser } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateRoleDto } from '../auth/dto/update-role.dto';
import { Public } from '../sig/decorators/public.decorator';
import { Roles } from '../sig/decorators/roles.decorator';
import { CurrentUser } from '../sig/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  @Throttle({
    auth: {
      ttl: 60000,
      limit: 10,
    },
  })
  @Public()
  @ApiOperation({ summary: 'Connexion Utilisateur (Direct Users Endpoint)' })
  @ApiBody({
    schema: {
      example: {
        email: 'madiorfall@example.com',
        passwordHash: '654321',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    return this.usersService.login(loginUserDto, req.ip, req.get('user-agent'));
  }

  @Post()
  @Throttle({
    auth: {
      ttl: 60000,
      limit: 10,
    },
  })
  @Public()
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé.' })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.usersService.create(createUserDto, actorId, req.ip, req.get('user-agent'));
  }

  @Get()
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({ summary: 'Lister tous les utilisateurs (Admin/Analyste)' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.usersService.update(id, updateUserDto, actorId, req.ip, req.get('user-agent'));
  }

  @Patch(':id/role')
  @Roles(RoleUser.ADMIN)
  @ApiOperation({ summary: "Modifier le rôle d'un utilisateur (Admin uniquement)" })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.usersService.updateRole(id, dto.role, actorId, req.ip, req.get('user-agent'));
  }

  @Delete(':id')
  @Roles(RoleUser.ADMIN)
  @ApiOperation({ summary: 'Supprimer un utilisateur (Admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé.' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.usersService.remove(id, actorId, req.ip, req.get('user-agent'));
  }
}
