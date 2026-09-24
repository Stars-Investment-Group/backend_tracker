import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';
import { CountriesService } from './countries.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';


@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lister tous les pays',
    description: 'Retourne tous les pays enregistrés',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des pays retournée avec succès',
  })
  findAll(@Query() createCountryDto: CreateCountryDto) {
    return this.countriesService.findAll(createCountryDto);
  }
  
  @Public()
  @Get('regions')
  @ApiOperation({
    summary: 'Obtenir un pays par région',
    description: 'Retourne un pays spécifique par région',
  })
  @ApiResponse({ status: 200, description: 'pays retourné avec succès' })
  @ApiResponse({ status: 404, description: 'pays non trouvé' })
  findRegions() {
    return this.countriesService.findRegions();
  }

  @Public()
  @Get(':code/overview')
  @ApiOperation({
    summary: 'Obtenir un pays par code overview',
    description: 'Retourne un pays spécifique par code overview',
  })
  @ApiResponse({ status: 200, description: 'pays retourné avec succès' })
  @ApiResponse({ status: 404, description: 'pays non trouvé' })
  getOverview(@Param('code') code: string) {
    return this.countriesService.getOverview(code);
  }
  
  @Public()
  @Get(':code')
  @ApiOperation({
    summary: 'Obtenir un pays par code',
    description: 'Retourne un pays spécifique par code',
  })
  @ApiResponse({ status: 200, description: 'pays retourné avec succès' })
  @ApiResponse({ status: 404, description: 'pays non trouvé' })
  findOne(@Param('code') code: string) {
    return this.countriesService.findOne(code);
  }
}
