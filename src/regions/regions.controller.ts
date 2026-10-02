import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';


@ApiTags('Région Snapshot')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}


  @Public()
  @Get()
  @ApiOperation({
    summary: 'Liste des régions',
    description: 'Retourne la liste des régions',
  })
  @ApiResponse({
    status: 200,
    description: 'regions retourné avec succès',
  })
  async getRegions() {
    return this.regionsService.getRegions();
  }


  @Public()
  @Get(':code/snapshot')
  @ApiOperation({
    summary: 'Snapshot d\'une région',
    description: 'Retourne état de la situation d\'une région',
  })
  @ApiResponse({
    status: 200,
    description: 'état de la situation retourné avec succès',
  })
  async getSnapshot(@Param('code') code: string) {
    return this.regionsService.getSnapshot(code);
  }


  @Public()
  @Get(':code/countries')
  @ApiOperation({
    summary: 'Pays d\'une région',
    description: 'Retourne un pays d\'une région',
  })
  @ApiResponse({
    status: 200,
    description: 'Pays retourné avec succès',
  })
  async getCountries(@Param('code') code: string) {
    return this.regionsService.getCountries(code);
  }


  @Public()
  @Get(':code/heatmap')
  @ApiOperation({
    summary: 'Pays d\'une région',
    description: 'Retourne un pays d\'une région',
  })
  @ApiResponse({
    status: 200,
    description: 'Pays retourné avec succès',
  })
  async getHeatmap(@Param('code') code: string) {
    return this.regionsService.getHeatmap(code);
  }
}
