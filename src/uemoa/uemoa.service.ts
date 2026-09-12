import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { FindIndicatorsDto } from './dto/find-indicators.dto';
import { SERIES_TO_SYNC } from './series.config';

const DBNOMICS_BASE_URL = 'https://api.db.nomics.world/v22';

export interface TransformedIndicator {
  provider: string;
  dataset: string;
  seriesCode: string;
  seriesName: string;
  country: string | null;
  period: string;
  value: number | null;
}

export interface LoadResult {
  crees: number;
  revises: number;
  inchanges: number;
}

@Injectable()
export class UemoaService {
  private readonly logger = new Logger(UemoaService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly db: DatabaseService,
  ) {}

  // ---------- EXTRACT ----------

  async fetchSeries(provider: string, dataset: string, seriesCode: string) {
    const url = `${DBNOMICS_BASE_URL}/series/${provider}/${dataset}/${seriesCode}?observations=1`;
    this.logger.log(`Appel DBnomics : ${url}`);
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  // ---------- TRANSFORM ----------

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
      value: this.toNumber(value[index]),
    }));
  }

  /**
   * DBnomics represente les valeurs manquantes par la chaine "NA".
   * Toute valeur non numerique est convertie en null et sera ecartee au chargement.
   */
  private toNumber(v: unknown): number | null {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  // ---------- LOAD ----------

  /**
   * LOAD avec gestion des millesimes, optimise pour limiter les allers-retours.
   *
   * Au lieu d'interroger la base pour chaque observation, on charge en une seule
   * requete toutes les valeurs courantes de la serie, on compare en memoire, puis
   * on ecrit de facon groupee. On passe d'environ 130 requetes par serie a 3 ou 4.
   *
   * Trois cas, inchanges sur le fond :
   *   1. Aucune valeur connue -> creation d'une premiere version
   *   2. Valeur identique     -> aucune nouvelle ligne, lastSeenAt rafraichi en lot
   *   3. Valeur revisee       -> ancienne version archivee, nouvelle version creee
   */
  async saveIndicators(rows: TransformedIndicator[]): Promise<LoadResult> {
    const res: LoadResult = { crees: 0, revises: 0, inchanges: 0 };
    if (rows.length === 0) return res;

    const maintenant = new Date();
    const aujourdhui = new Date();
    aujourdhui.setUTCHours(0, 0, 0, 0);

    // Seules les observations numeriques sont exploitables
    const valides = rows.filter(
      (r) => r.value !== null && typeof r.value === 'number' && Number.isFinite(r.value),
    );
    if (valides.length === 0) return res;

    const { provider, dataset, seriesCode } = valides[0];

    // 1 requete : toutes les versions courantes de cette serie
    const existantes = await this.db.economicIndicator.findMany({
      where: { provider, dataset, seriesCode, isLatest: true },
      select: { id: true, period: true, value: true },
    });
    const parPeriode = new Map(existantes.map((e) => [e.period, e]));

    const aCreer: any[] = [];
    const aArchiver: string[] = [];
    const inchangees: string[] = [];

    for (const row of valides) {
      const courant = parPeriode.get(row.period);

      if (!courant) {
        aCreer.push({
          provider: row.provider,
          dataset: row.dataset,
          seriesCode: row.seriesCode,
          seriesName: row.seriesName,
          country: row.country,
          period: row.period,
          value: row.value as number,
          vintageDate: aujourdhui,
          isLatest: true,
          lastSeenAt: maintenant,
        });
        res.crees++;
        continue;
      }

      if (courant.value === row.value) {
        inchangees.push(courant.id);
        res.inchanges++;
        continue;
      }

      aArchiver.push(courant.id);
      aCreer.push({
        provider: row.provider,
        dataset: row.dataset,
        seriesCode: row.seriesCode,
        seriesName: row.seriesName,
        country: row.country,
        period: row.period,
        value: row.value as number,
        vintageDate: aujourdhui,
        isLatest: true,
        lastSeenAt: maintenant,
      });
      this.logger.log(
        `Revision ${row.seriesCode} ${row.period} : ${courant.value} -> ${row.value}`,
      );
      res.revises++;
    }

    // Ecritures groupees, dans une transaction pour garantir la coherence
    const operations: Prisma.PrismaPromise<unknown>[] = [];

    if (aArchiver.length > 0) {
      operations.push(
        this.db.economicIndicator.updateMany({
          where: { id: { in: aArchiver } },
          data: { isLatest: false },
        }),
      );
    }

    if (aCreer.length > 0) {
      operations.push(
        this.db.economicIndicator.createMany({
          data: aCreer,
          skipDuplicates: true,
        }),
      );
    }

    if (inchangees.length > 0) {
      operations.push(
        this.db.economicIndicator.updateMany({
          where: { id: { in: inchangees } },
          data: { lastSeenAt: maintenant },
        }),
      );
    }

    if (operations.length > 0) {
      await this.db.$transaction(operations);
    }

    this.logger.log(
      `${res.crees} creees, ${res.revises} revisees, ${res.inchanges} inchangees`,
    );
    return res;
  }

  // ---------- PIPELINE ----------

  async syncSeries(
    provider: string,
    dataset: string,
    seriesCode: string,
    country: string | null = null,
  ): Promise<LoadResult> {
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
        this.logger.log(
          `OK ${config.seriesCode} : ${count.crees} creees, ${count.revises} revisees, ${count.inchanges} inchangees`,
        );
      } catch (error) {
        this.logger.error(
          `ECHEC ${config.provider}/${config.dataset}/${config.seriesCode} : ${error.message}`,
        );
      }
    }

    this.logger.log('Synchronisation terminée.');
  }

  // ---------- LECTURE (API) ----------

  /**
   * Récupère les indicateurs, avec filtres optionnels.
   * Triés par série puis par période croissante (ordre chronologique).
   */
  async findIndicators(filters: FindIndicatorsDto) {
    const where: any = {};
    if (filters.country) where.country = filters.country;
    if (filters.dataset) where.dataset = filters.dataset;
    if (filters.provider) where.provider = filters.provider;
    if (filters.seriesCode) where.seriesCode = filters.seriesCode;

    if (!filters.includeRevisions) where.isLatest = true;

    return this.db.economicIndicator.findMany({
      where,
      orderBy: [{ seriesCode: 'asc' }, { period: 'asc' }, { vintageDate: 'desc' }],
    });
  }

  /**
   * Liste les séries distinctes présentes en base, avec leur date de dernière
   * récupération. Utile pour alimenter un sélecteur côté frontend.
   */
  async listAvailableSeries() {
    const rows = await this.db.economicIndicator.findMany({
      where: { isLatest: true },
      distinct: ['provider', 'dataset', 'seriesCode'],
      select: {
        provider: true,
        dataset: true,
        seriesCode: true,
        seriesName: true,
        country: true,
        vintageDate: true,
        lastSeenAt: true,
      },
      orderBy: { seriesCode: 'asc' },
    });
    return rows;
  }

  /**
   * Historique complet des revisions d'une observation precise.
   * Alimente le bloc "Revision History" des maquettes.
   */
  async getRevisionHistory(
    provider: string,
    dataset: string,
    seriesCode: string,
    period: string,
  ) {
    return this.db.economicIndicator.findMany({
      where: { provider, dataset, seriesCode, period },
      orderBy: { vintageDate: 'desc' },
      select: {
        period: true,
        value: true,
        vintageDate: true,
        isLatest: true,
        lastSeenAt: true,
      },
    });
  }

  // ---------- ORDONNANCEMENT ----------

  /**
   * Tâche planifiée : s'exécute automatiquement chaque jour à 6h00 du matin.
   */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleDailySync() {
    this.logger.log('--- Lancement du sync quotidien UEMOA (cron) ---');
    await this.syncAll();
  }
}
