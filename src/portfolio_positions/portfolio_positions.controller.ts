import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { PortfolioPositionsService } from './portfolio_positions.service';
import { CreatePortfolioPositionDto } from './dto/create-portfolio_position.dto';
import { UpdatePortfolioPositionDto } from './dto/update-portfolio_position.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/sig/decorators/roles.decorator';


@ApiTags('portfolio-positions')
@ApiBearerAuth('access-token')
@Controller('portfolio-positions')
export class PortfolioPositionsController {
  constructor(private readonly portfolioPositionsService: PortfolioPositionsService) {}



  @Get()
  @ApiOperation({
    summary: 'Lister tous les portfolio-positions',
    description: 'Retourne tous les portfolio-positions enregistrés',
  })
  @ApiResponse({status: 201, description: 'liste tous les portfolio-positions avec succès'})
  findAll() {
    return this.portfolioPositionsService.findAll();
  }

  @Get('portfolio/:portfolioId')
  @ApiOperation({
    summary: 'Obtenir un portfolio-positions par ID',
    description: 'Retourne un portfolio-positions spécifique en fonction de son ID.',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du portfolio-positions" })
  @ApiResponse({ status: 200, description: 'portfolio-positions trouvé.' })
  @ApiResponse({ status: 404, description: 'portfolio-positions non trouvé.' })
  findByPortfolio(
    @Param('portfolioId', ParseUUIDPipe) portfolioId: string,
  ) {
    return this.portfolioPositionsService.findByPortfolio(
      portfolioId,
    );
  }


}
