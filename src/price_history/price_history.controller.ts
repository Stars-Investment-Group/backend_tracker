import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleUser } from '@prisma/client';
import { Roles } from '../sig/decorators/roles.decorator';
import { PriceHistoryService } from './price_history.service';
import { CreatePriceHistoryDto } from './dto/create-price-history.dto';
import { BulkCreatePriceHistoryDto } from './dto/bulk-create-price-history.dto';
import { QueryPriceHistoryDto } from './dto/query-price-history.dto';

@ApiTags('Price History (Historique des Cours)')
@ApiBearerAuth('access-token')
@Controller('price-history')
export class PriceHistoryController {
  constructor(private readonly priceHistoryService: PriceHistoryService) {}

  @Post()
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({
    summary: 'Enregistrer une cotation de cours (OHLCV)',
    description: "Ajoute ou met à jour le cours d'un instrument à un instant T (Admin/Analyste).",
  })
  @ApiResponse({ status: 201, description: 'Cotation enregistrée avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Instrument introuvable.' })
  create(@Body() dto: CreatePriceHistoryDto) {
    return this.priceHistoryService.create(dto);
  }

  @Post('bulk')
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({
    summary: 'Ingestion en lot de cotations (Bulk Insert)',
    description: 'Enregistre une liste de cotations de cours (Admin/Analyste).',
  })
  @ApiResponse({ status: 201, description: 'Lot de cotations inséré avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  bulkCreate(@Body() dto: BulkCreatePriceHistoryDto) {
    return this.priceHistoryService.bulkCreate(dto);
  }

  @Get('instrument/:instrumentId')
  @ApiOperation({
    summary: 'Historique des cours par ID d’instrument',
    description: 'Retourne les cours historiques avec pagination et filtres de dates.',
  })
  @ApiParam({ name: 'instrumentId', required: true, description: "L'UUID de l'instrument" })
  @ApiResponse({ status: 200, description: 'Historique des cours retourné avec succès.' })
  @ApiResponse({ status: 404, description: 'Instrument introuvable.' })
  findByInstrument(
    @Param('instrumentId', ParseUUIDPipe) instrumentId: string,
    @Query() query: QueryPriceHistoryDto,
  ) {
    return this.priceHistoryService.findByInstrument(instrumentId, query);
  }

  @Get('ticker/:ticker')
  @ApiOperation({
    summary: 'Historique des cours par symbole boursier (Ticker)',
    description: 'Retourne les cours historiques en recherchant par ticker (ex: AAPL, BRVM:SNTS).',
  })
  @ApiParam({ name: 'ticker', required: true, description: "Le symbole boursier de l'instrument (ex: AAPL)" })
  @ApiResponse({ status: 200, description: 'Historique des cours retourné avec succès.' })
  @ApiResponse({ status: 404, description: 'Instrument introuvable.' })
  findByTicker(
    @Param('ticker') ticker: string,
    @Query() query: QueryPriceHistoryDto,
  ) {
    return this.priceHistoryService.findByTicker(ticker, query);
  }

  @Get('latest/:instrumentId')
  @ApiOperation({
    summary: 'Dernier cours connu (Latest Quote)',
    description: 'Retourne la cotation la plus récente pour la valorisation du portefeuille.',
  })
  @ApiParam({ name: 'instrumentId', required: true, description: "L'UUID de l'instrument" })
  @ApiResponse({ status: 200, description: 'Dernière cotation trouvée.' })
  @ApiResponse({ status: 404, description: 'Instrument ou cotation non trouvée.' })
  getLatestPrice(@Param('instrumentId', ParseUUIDPipe) instrumentId: string) {
    return this.priceHistoryService.getLatestPrice(instrumentId);
  }

  @Delete(':id')
  @Roles(RoleUser.ADMIN)
  @ApiOperation({
    summary: 'Supprimer une cotation',
    description: 'Supprime un point de cours spécifique (Admin uniquement).',
  })
  @ApiParam({ name: 'id', required: true, description: "L'UUID de la cotation" })
  @ApiResponse({ status: 200, description: 'Cotation supprimée avec succès.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Cotation non trouvée.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.priceHistoryService.remove(id);
  }
}
