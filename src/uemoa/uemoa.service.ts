import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
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
}
