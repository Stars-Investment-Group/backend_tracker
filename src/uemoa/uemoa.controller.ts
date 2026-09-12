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
  @ApiQuery({
    name: 'includeRevisions', required: false, example: 'false',
    description:
      "Par défaut seule la version courante de chaque observation est retournée. " +
      "Mettre à true pour obtenir également les versions antérieures (millésimes).",
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

  @Public()
  @Get('revisions')
  @ApiOperation({
    summary: "Historique des révisions d'une observation",
    description:
      "Retourne toutes les versions successives publiées pour une série et une période " +
      "données, de la plus récente à la plus ancienne. Chaque version porte son millésime " +
      "(date à laquelle la valeur a été publiée par la source). Alimente le bloc " +
      "« Revision History » du Data Explorer.",
  })
  @ApiQuery({ name: 'provider', required: true, example: 'BCEAO' })
  @ApiQuery({ name: 'dataset', required: true, example: 'TC_A' })
  @ApiQuery({ name: 'seriesCode', required: true, example: 'ZZZSF3100A0GP' })
  @ApiQuery({ name: 'period', required: true, example: '2024' })
  @ApiResponse({
    status: 200,
    description: "Versions successives, de la plus récente à la plus ancienne.",
    schema: {
      example: [
        { period: '2024', value: 606.35, vintage_date: '2026-08-29', is_latest: true,
          last_seen_at: '2026-09-10T23:13:17.000Z' },
        { period: '2024', value: 604.10, vintage_date: '2026-05-14', is_latest: false,
          last_seen_at: '2026-08-28T06:00:00.000Z' },
      ],
    },
  })
  async getRevisions(
    @Query('provider') provider: string,
    @Query('dataset') dataset: string,
    @Query('seriesCode') seriesCode: string,
    @Query('period') period: string,
  ) {
    return this.uemoaService.getRevisionHistory(provider, dataset, seriesCode, period);
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
