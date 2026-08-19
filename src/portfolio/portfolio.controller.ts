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
    summary: 'Lister tous les portfeuilles',
    description: 'Retourne tous les portfeuilles enregistrés (optionnellement filtrés par userId)',
  })
  @ApiResponse({ status: 200, description: 'Liste des portfeuilles retournée avec succès' })
  async findAll(@Query('userId') userId?: string) {
    return this.portfolioService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un portfeuille par ID',
    description: 'Retourne un portefeuille avec ses transactions et son propriétaire',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portefeuille" })
  @ApiResponse({ status: 200, description: 'Portefeuille retourné avec succès' })
  @ApiResponse({ status: 404, description: 'Portefeuille non trouvé' })
  async findOne(@Param('id') id: string) {
    return this.portfolioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un portfeuille',
    description: "Modifie les informations d'un portfeuille existant.",
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portefeuille" })
  @ApiResponse({ status: 200, description: 'Portefeuille mis à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 404, description: 'Portefeuille non trouvé.' })
  async update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(id, updatePortfolioDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un portfeuille',
    description: 'Supprime un portfeuille.',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portefeuille" })
  @ApiResponse({ status: 200, description: 'Portefeuille supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Portefeuille non trouvé.' })
  async remove(@Param('id') id: string) {
    return this.portfolioService.remove(id);
  }
}
