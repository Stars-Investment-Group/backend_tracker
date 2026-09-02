import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CurrentUser } from '../sig/decorators/current-user.decorator';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('portfeuille')
@ApiBearerAuth('access-token')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un portfeuille',
    description: 'Ajoute un nouveau portfeuille pour un utilisateur',
  })
  @ApiResponse({ status: 201, description: 'Portfeuille ajouté avec succès' })
  @ApiResponse({ status: 400, description: 'Données Invalides' })
  async create(
    @Body() createPortfolioDto: CreatePortfolioDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.portfolioService.create(createPortfolioDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les portefeuilles',
    description: "Retourne les portefeuilles de l'utilisateur connecté (ou tous pour les Admin/Analystes)",
  })
  @ApiResponse({ status: 200, description: 'Liste des portefeuilles retournée avec succès' })
  async findAll(@CurrentUser() user: any, @Query('userId') userId?: string) {
    return this.portfolioService.findAll(user, userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un portefeuille par ID',
    description: 'Retourne un portefeuille avec ses transactions et son propriétaire',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portefeuille" })
  @ApiResponse({ status: 200, description: 'Portefeuille retourné avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Portefeuille non trouvé' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.portfolioService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un portefeuille',
    description: "Modifie les informations d'un portefeuille existant.",
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portefeuille" })
  @ApiResponse({ status: 200, description: 'Portefeuille mis à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Portefeuille non trouvé.' })
  async update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
    @CurrentUser() user: any,
  ) {
    return this.portfolioService.update(id, updatePortfolioDto, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un portefeuille',
    description: 'Supprime un portefeuille.',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portefeuille" })
  @ApiResponse({ status: 200, description: 'Portefeuille supprimé avec succès.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Portefeuille non trouvé.' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.portfolioService.remove(id, user);
  }
}
