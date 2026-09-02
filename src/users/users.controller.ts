import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RoleUser } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from '../auth/dto/update-role.dto';
import { Roles } from '../sig/decorators/roles.decorator';
import { CurrentUser } from '../sig/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleUser.ADMIN)
  @ApiOperation({ summary: 'Créer un utilisateur (Admin uniquement)' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 403, description: 'Accès interdit - Rôle Admin requis.' })
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
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: any) {
    if (
      currentUser.id !== id &&
      currentUser.role !== RoleUser.ADMIN &&
      currentUser.role !== RoleUser.ANALYSTE
    ) {
      throw new ForbiddenException('Accès refusé. Vous ne pouvez consulter que votre propre profil.');
    }
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: any,
    @Req() req: Request,
  ) {
    if (currentUser.id !== id && currentUser.role !== RoleUser.ADMIN) {
      throw new ForbiddenException('Accès refusé. Vous ne pouvez modifier que votre propre profil.');
    }
    return this.usersService.update(id, updateUserDto, currentUser.id, req.ip, req.get('user-agent'));
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
