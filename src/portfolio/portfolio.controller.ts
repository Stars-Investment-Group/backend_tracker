import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CurrentUser } from 'src/sig/decorators/current-user.decorator';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('portfeuille')
@ApiBearerAuth('access-token')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un portfeuille',
    description: 'Ajoute un nouveau portfeuille',
  })
  @ApiResponse({status: 201, description: 'portfeuille ajouté avec succès' })
  @ApiResponse({status: 400, description: 'Données Invalide' })
  async create(@Body() createPortfolioDto: CreatePortfolioDto, @CurrentUser() user: any) {
    return this.portfolioService.create(createPortfolioDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister tous les portfeuilles',
    description: 'Retourne tous les portfeuilles enregistrés',
  })
  @ApiResponse({status: 201, description: 'liste tous les portfeuilles avec succès'})
  async findAll() {
    return this.portfolioService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir des portfeuilles par filtre', 
    description: 'retourne un ou des portfeuilles par filtre'
  })
  @ApiResponse({status: 200, description: 'portfeuille retourne avec succes'})
  @ApiResponse({status: 404, description: 'filtre impossible'})
  async findOne(@Param('id') id: string) {
    return this.portfolioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un portfeuille',
    description: "Modifie les informations d'un portfeuille existant.",
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portfeuille" })
  @ApiResponse({ status: 200, description: 'portfeuille mis à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 404, description: 'portfeuille non trouvé.' })
  async update(@Param('id') id: string, @Body() updatePortfolioDto: UpdatePortfolioDto) {
    return this.portfolioService.update(id, updatePortfolioDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un portfeuille',
    description: 'Supprime un portfeuille.',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portfeuille" })
  @ApiResponse({ status: 200, description: 'portfeuille supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'portfeuille non trouvé.' })
  async remove(@Param('id') id: string) {
    return this.portfolioService.remove(id);
  }
}
