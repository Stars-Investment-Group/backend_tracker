import {
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { Response } from 'express';import { Public } from 'src/sig/decorators/public.decorator';
import { DataExplorerService } from './data-explorer.service';
import { CreateDataExplorerDto } from './dto/create-data-explorer.dto';
import { UpdateDataExplorerDto } from './dto/update-data-explorer.dto';


@ApiTags('Data explorer')
@Controller('data-explorer')
export class DataExplorerController {
  constructor(private readonly dataExplorerService: DataExplorerService) {}

  // ============================================================
  // GET /explorer/indicators
  // ============================================================

  @Public()
  @Get('indicators')
  @ApiOperation({
    summary: 'Liste des indicateurs disponibles',
    description: 'Retourne la liste des indicateurs disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'indicateurs retournés avec succès',
  })
  async getIndicators() {
    return this.dataExplorerService.getIndicators();
  }

  // ============================================================
  // GET /explorer/series
  // ============================================================

  @Public()
  @Get('series')
  @ApiOperation({
    summary: 'Série complète',
    description: 'Retourne la liste des séries complètes',
  })
  @ApiResponse({
    status: 200,
    description: 'série retournée avec succès',
  })
  async getSeries(
    @Query('country') country?: string,
    @Query('indicator') indicator?: string,
  ) {
    return this.dataExplorerService.getSeries(
      country,
      indicator,
    );
  }

  // ============================================================
  // GET /explorer/series/:id/vintages
  // ============================================================

  @Public()
  @Get('series/:id/vintages')
  @ApiOperation({
    summary: 'Vintages d\'une série',
    description: 'Retourne Vintages',
  })
  @ApiResponse({
    status: 200,
    description: 'vintages retournés avec succès',
  })
  async getVintages(
    @Param('id') id: string,
  ) {
    return this.dataExplorerService.getVintages(id);
  }

  // ============================================================
  // GET /explorer/series/:id/related
  // ============================================================
  @Public()
  @Get('series/:id/related')
  @ApiOperation({
    summary: 'Indicateurs corrélés',
    description: 'Retourne Indicateurs corrélés',
  })
  @ApiResponse({
    status: 200,
    description: 'Indicateurs corrélés retournés avec succès',
  })
  async getRelated(
    @Param('id') id: string,
  ) {
    return this.dataExplorerService.getRelated(id);
  }

  // ============================================================
  // GET /explorer/series/:id/quality
  // ============================================================
  @Public()
  @Get('series/:id/quality')
  @ApiOperation({
    summary: 'Score de qualité',
    description: 'Retourne Score de qualité',
  })
  @ApiResponse({
    status: 200,
    description: 'Score de qualité retourné avec succès',
  })
  async getQuality(
    @Param('id') id: string,
  ) {
    return this.dataExplorerService.getQuality(id);
  }

  // ============================================================
  // GET /explorer/series/:id/export
  // ============================================================
  @Public()
  @Get('series/:id/export')
  @ApiOperation({
    summary: 'Export',
    description: 'Exporter les données ',
  })
  @ApiResponse({
    status: 200,
    description: 'Export réussit',
  })
  async exportSeries(
    @Param('id') id: string,

    @Query('format')
    format: string = 'csv',

    @Res() response: Response,
  ) {
    const result =
      await this.dataExplorerService.exportSeries(
        id,
        format,
      );

    if (format === 'json') {
      return response.json(result);
    }

    if (format === 'csv') {
      response.setHeader(
        'Content-Type',
        'text/csv; charset=utf-8',
      );

      response.setHeader(
        'Content-Disposition',
        `attachment; filename="${id}.csv"`,
      );

      return response.send(result);
    }

    return response.send(result);
  }
}
