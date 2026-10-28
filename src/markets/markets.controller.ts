import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';


@ApiTags('Markets')
@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Public()
  @Get('summary')
  @ApiOperation({
    summary: 'Vue d\'ensemble (mood, top actifs)',
    description:
      "Retourne la vue d\'ensemble (mood, top actifs)",
  })
  @ApiResponse({
    status: 200,
    description: 'Vue retournée avec succès',
  })
  getSummary() {
    return this.marketsService.getSummary();
  }

  @Public()
  @Get('indices')
  @ApiOperation({
    summary: 'Liste des indices avec performance',
    description:
      "Retourne la Liste des indices avec performance",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des données retournée avec succès',
  })
  getIndices(
    @Query('category') category?: string,
    @Query('region') region?: string,
    @Query('countryCode') countryCode?: string,
  ) {
    return this.marketsService.getIndices({
      category,
      region,
      countryCode,
    });
  }

  @Public()
  @Get('yields')
  @ApiOperation({
    summary: 'Taux souverains et variations',
    description:
      "Retourne taux",
  })
  @ApiResponse({
    status: 200,
    description: 'Taux des données retournée avec succès',
  })
  getYields(
    @Query('countryCode') countryCode?: string,
    @Query('maturity') maturity?: string,
  ) {
    return this.marketsService.getYields({
      countryCode,
      maturity,
    });
  }

  @Public()
  @Get('commodities')
  @ApiOperation({
    summary: 'Prix matières premières (or, pétrole, etc.)',
    description:
      "Retourne Prix matières",
  })
  @ApiResponse({
    status: 200,
    description: 'Prix matières retournée avec succès',
  })
  getCommodities() {
    return this.marketsService.getCommodities();
  }

  @Public()
  @Get('conditions')
  @ApiOperation({
    summary: 'Conditions de financement',
    description:
      "Retourne les Conditions de financement",
  })
  @ApiResponse({
    status: 200,
    description: 'Conditions de financement retournée avec succès',
  })
  getConditions() {
    return this.marketsService.getConditions();
  }

  @Public()
  @Get('market-hours')
  @ApiOperation({
    summary: 'Heures d\'ouverture des marchés',
    description:
      "Retourne heures d\'ouverture des marchés",
  })
  @ApiResponse({
    status: 200,
    description: 'heures retournées avec succès',
  })
  getMarketHours() {
    return this.marketsService.getMarketHours();
  }
}
