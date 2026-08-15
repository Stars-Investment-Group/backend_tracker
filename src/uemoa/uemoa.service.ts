import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const DBNOMICS_BASE_URL = 'https://api.db.nomics.world/v22';

@Injectable()
export class UemoaService {
  private readonly logger = new Logger(UemoaService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Récupère une série économique depuis DBnomics.
   * Exemple : provider="BCEAO", dataset="PIB", seriesCode="A.SN..."
   */
  async fetchSeries(provider: string, dataset: string, seriesCode: string) {
    const url = `${DBNOMICS_BASE_URL}/series/${provider}/${dataset}/${seriesCode}?observations=1`;

    this.logger.log(`Appel DBnomics : ${url}`);

    const response = await firstValueFrom(this.httpService.get(url));

    return response.data;
  }
}
