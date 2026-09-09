import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PortfolioPositionsService } from './portfolio_positions.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../sig/decorators/current-user.decorator';

@ApiTags('portfolio-positions')
@ApiBearerAuth('access-token')
@Controller('portfolio-positions')
export class PortfolioPositionsController {
  constructor(private readonly portfolioPositionsService: PortfolioPositionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister les positions',
    description: "Retourne les positions de l'utilisateur connecté (ou toutes pour Admin/Analystes)",
  })
  @ApiResponse({ status: 200, description: 'Positions retournées avec succès' })
  findAll(@CurrentUser('id') user: any) {
    return this.portfolioPositionsService.findAll(user);
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({
    summary: 'Obtenir les positions d’un portefeuille par ID',
    description: 'Retourne les positions consolidées d’un portefeuille spécifique.',
  })
  @ApiParam({ name: 'portfolioId', required: true, description: "L'UUID du portefeuille" })
  @ApiResponse({ status: 200, description: 'Positions trouvées.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Portefeuille non trouvé.' })
  findByPortfolio(
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
    @CurrentUser('id') user: any,
  ) {
    return this.portfolioPositionsService.findByPortfolio(portfolioId, user);
  }
}
