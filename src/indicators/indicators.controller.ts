import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';


@ApiTags('Macro Indicators')
@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

 
  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lister tous les indicators',
    description: 'Retourne tous les indicators enregistrés',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des indicators retournée avec succès',
  })
  findAll() {
    return this.indicatorsService.findAll();
  }

 /**
   * GET /indicators/categories
   */
 @Public()
 @Get('categories')
 @ApiOperation({
    summary: 'Obtenir un Indicator par categorie',
    description: 'Retourne un Indicator spécifique par catégorie',
  })
  @ApiResponse({ status: 200, description: 'Indicator retourné avec succès' })
  @ApiResponse({ status: 404, description: 'Indicator non trouvé' })
 findCategories() {
   return this.indicatorsService.findCategories();
 }

 /**
  * GET /indicators/:code
  */
 @Public()
 @Get(':code')
 @ApiOperation({
  summary: 'Obtenir un Indicator par code',
  description: 'Retourne un Indicator spécifique par code',
})
@ApiResponse({ status: 200, description: 'Indicator retourné avec succès' })
@ApiResponse({ status: 404, description: 'Indicator non trouvé' })
 findOne(@Param('code') code: string) {
   return this.indicatorsService.findOne(code);
 }
}
