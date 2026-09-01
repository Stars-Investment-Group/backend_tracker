import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RoleUser } from '@prisma/client';
import { Public } from '../sig/decorators/public.decorator';
import { Roles } from '../sig/decorators/roles.decorator';
import { UemoaService } from './uemoa.service';
import { FindIndicatorsDto } from './dto/find-indicators.dto';

@ApiTags('UEMOA - Données économiques')
@Controller('uemoa')
export class UemoaController {
  constructor(private readonly uemoaService: UemoaService) {}

  @Public()
  @Get('indicators')
  @ApiOperation({
    summary: 'Récupérer les indicateurs économiques UEMOA',
    description:
      "Retourne les observations économiques stockées en base, triées par série puis par " +
      "période croissante. Tous les filtres sont optionnels et cumulables. Source : BCEAO " +
      "via DBnomics, synchronisée automatiquement chaque jour à 6h.",
  })
  @ApiQuery({
    name: 'country', required: false, example: 'SN',
    description: "Code pays ISO à 2 lettres. Absent pour les séries régionales (ensemble UMOA).",
  })
  @ApiQuery({
    name: 'dataset', required: false, example: 'TC_A',
    description: "Jeu de données BCEAO. Ex : TC_A (taux de change annuel), PIBN (PIB nominal).",
  })
  @ApiQuery({
    name: 'provider', required: false, example: 'BCEAO',
    description: 'Fournisseur de la donnée.',
  })
  @ApiQuery({
    name: 'seriesCode', required: false, example: 'ZZZSF3100A0GP',
    description: "Code exact de la série, pour cibler un seul indicateur.",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des observations.',
    schema: {
      example: [
        {
          id: '3f2b8c1a-...',
          provider: 'BCEAO',
          dataset: 'TC_A',
          series_code: 'ZZZSF3100A0GP',
          series_name: 'ENSEMBLE UMOA - Cours du dollar US',
          country: null,
          period: '2024',
          value: 606.35,
          fetched_at: '2026-08-29T18:40:00.000Z',
        },
      ],
    },
  })
  async findIndicators(@Query() query: FindIndicatorsDto) {
    return this.uemoaService.findIndicators(query);
  }

  @Public()
  @Get('series')
  @ApiOperation({
    summary: 'Lister les séries disponibles en base',
    description:
      "Retourne la liste des séries distinctes présentes en base, avec leur date de dernière " +
      "récupération. Pratique pour alimenter un sélecteur côté interface sans deviner ce qui existe.",
  })
  @ApiResponse({
    status: 200,
    description: 'Séries disponibles.',
    schema: {
      example: [
        {
          provider: 'BCEAO',
          dataset: 'PIBN',
          series_code: 'KKKSR1015A0BP',
          series_name: 'SENEGAL - PIB nominal',
          country: 'SN',
          fetched_at: '2026-08-29T18:40:00.000Z',
        },
      ],
    },
  })
  async listSeries() {
    return this.uemoaService.listAvailableSeries();
  }

  @Post('sync')
  @Roles(RoleUser.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Déclencher manuellement la synchronisation (Admin uniquement)',
    description:
      "Lance immédiatement le pipeline ETL (extraction DBnomics, transformation, écriture en " +
      "base) sans attendre l'exécution planifiée de 6h. L'opération est idempotente : elle met " +
      "à jour les valeurs existantes au lieu de créer des doublons.",
  })
  @ApiResponse({ status: 201, description: 'Synchronisation terminée.' })
  @ApiResponse({ status: 403, description: 'Accès refusé - Rôle Admin requis.' })
  async triggerSync() {
    await this.uemoaService.syncAll();
    return { message: 'Synchronisation UEMOA terminée.' };
  }
}
