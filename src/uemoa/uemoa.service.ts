import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../database/database.service';

const DBNOMICS_BASE_URL = 'https://api.db.nomics.world/v22';

export interface TransformedIndicator {
  provider: string;
  dataset: string;
  seriesCode: string;
  seriesName: string;
  country: string | null;
  period: string;
  value: number;
}

interface SeriesConfig {
  provider: string;
  dataset: string;
  seriesCode: string;
  country: string | null;
}

const SERIES_TO_SYNC: SeriesConfig[] = [
  { provider: 'BCEAO', dataset: 'TC_A', seriesCode: 'ZZZSF3100A0GP', country: null },
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'KKKSR1015A0BP', country: 'SN' },
];

@Injectable()
export class UemoaService {
  private readonly logger = new Logger(UemoaService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly db: DatabaseService,
  ) {}

  async fetchSeries(provider: string, dataset: string, seriesCode: string) {
    const url = `${DBNOMICS_BASE_URL}/series/${provider}/${dataset}/${seriesCode}?observations=1`;
    this.logger.log(`Appel DBnomics : ${url}`);
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  transformSeries(
    rawResponse: any,
    country: string | null = null,
  ): TransformedIndicator[] {
    const doc = rawResponse?.series?.docs?.[0];
    if (!doc) {
      this.logger.warn('Aucune série trouvée dans la réponse DBnomics');
      return [];
    }
    const { provider_code, dataset_code, series_code, series_name, period, value } = doc;
    return period.map((p: string, index: number) => ({
      provider: provider_code,
      dataset: dataset_code,
      seriesCode: series_code,
      seriesName: series_name,
      country,
      period: p,
      value: value[index],
    }));
  }

  async saveIndicators(rows: TransformedIndicator[]): Promise<number> {
    let savedCount = 0;

    for (const row of rows) {
      await this.db.economicIndicator.upsert({
        where: {
          provider_dataset_seriesCode_period: {
            provider: row.provider,
            dataset: row.dataset,
            seriesCode: row.seriesCode,
            period: row.period,
          },
        },
        update: {
          value: row.value,
          seriesName: row.seriesName,
          fetchedAt: new Date(),
        },
        create: {
          provider: row.provider,
          dataset: row.dataset,
          seriesCode: row.seriesCode,
          seriesName: row.seriesName,
          country: row.country,
          period: row.period,
          value: row.value,
        },
      });
      savedCount++;
    }

    this.logger.log(`${savedCount} indicateurs sauvegardés dans economic_indicators`);
    return savedCount;
  }

  async syncSeries(
    provider: string,
    dataset: string,
    seriesCode: string,
    country: string | null = null,
  ): Promise<number> {
    const raw = await this.fetchSeries(provider, dataset, seriesCode);
    const rows = this.transformSeries(raw, country);
    return this.saveIndicators(rows);
  }

  /**
   * Synchronise toutes les séries configurées (SERIES_TO_SYNC).
   */
  async syncAll(): Promise<void> {
    this.logger.log(`Démarrage de la synchronisation de ${SERIES_TO_SYNC.length} série(s)...`);

    for (const config of SERIES_TO_SYNC) {
      try {
        const count = await this.syncSeries(
          config.provider,
          config.dataset,
          config.seriesCode,
          config.country,
        );
        this.logger.log(`✓ ${config.provider}/${config.dataset}/${config.seriesCode} : ${count} lignes`);
      } catch (error) {
        this.logger.error(
          `✗ Échec pour ${config.provider}/${config.dataset}/${config.seriesCode} : ${error.message}`,
        );
      }
    }

    this.logger.log('Synchronisation terminée.');
  }

  /**
   * Tâche planifiée : s'exécute automatiquement chaque jour à 6h00 du matin.
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleDailySync() {
    this.logger.log('--- Lancement du sync quotidien UEMOA (cron) ---');
    await this.syncAll();
  }
}
