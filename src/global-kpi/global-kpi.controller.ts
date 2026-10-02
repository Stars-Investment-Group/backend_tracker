import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GlobalKpiService } from './global-kpi.service';
import { CreateGlobalKpiDto } from './dto/create-global-kpi.dto';
import { UpdateGlobalKpiDto } from './dto/update-global-kpi.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';


@ApiTags('Global Kpi')
@Controller('global-kpi')
export class GlobalKpiController {
  constructor(private readonly globalKpiService: GlobalKpiService) {}

  @Public()
  @Get('kpis')
  @ApiOperation({
    summary: 'KPI mondiaux',
    description: 'Retourne la liste kpi mondiaux',
  })
  @ApiResponse({
    status: 200,
    description: 'kpi retourné avec succès',
  })
  async getKpis() {
    return this.globalKpiService.getKpis();
  }


  @Public()
  @Get('house-view')
  @ApiOperation({
    summary: 'House View',
    description: 'Retourne House View',
  })
  @ApiResponse({
    status: 200,
    description: 'View retourné avec succès',
  })
  async getHouseView() {
    return this.globalKpiService.getHouseView();
  }


  @Public()
  @Get('risk-index')
  @ApiOperation({
    summary: 'Risque',
    description: 'Retourne risque',
  })
  @ApiResponse({
    status: 200,
    description: 'risque retourné avec succès',
  })
  async getRiskIndex() {
    return this.globalKpiService.getRiskIndex();
  }


  @Public()
  @Get('movers')
  @ApiOperation({
    summary: 'Pays qui changent',
    description: 'Retourne les pays qui changent',
  })
  @ApiResponse({
    status: 200,
    description: 'Pays retourné avec succès',
  })
  async getMovers() {
    return this.globalKpiService.getMovers();
  }


  @Public()
  @Get('heatmap')
  @ApiOperation({
    summary: 'Matrice des risques par région',
    description: 'Retourne Matrice des risques par région',
  })
  @ApiResponse({
    status: 200,
    description: 'Matrice des risques retourné avec succès',
  })
  async getHeatmap() {
    return this.globalKpiService.getHeatmap();
  }
}
