import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateDataExplorerDto } from './dto/create-data-explorer.dto';
import { UpdateDataExplorerDto } from './dto/update-data-explorer.dto';

@Injectable()
export class DataExplorerService {

  constructor(private readonly databaseService: DatabaseService) {}


  /**
   * Transforme :
   *
   * CIV__real_gdp_growth
   *
   * en :
   *
   * countryCode = CIV
   * indicatorCode = real_gdp_growth
   */
  private parseSeriesId(seriesId: string) {
    if (!seriesId) {
      throw new BadRequestException(
        'Le series_id est obligatoire',
      );
    }

    const parts = seriesId.split('__');

    if (parts.length !== 2) {
      throw new BadRequestException(
        'Le series_id doit respecter le format {country_code}__{indicator_code}',
      );
    }

    const [countryCode, indicatorCode] = parts;

    if (!countryCode || !indicatorCode) {
      throw new BadRequestException(
        'Le series_id doit respecter le format {country_code}__{indicator_code}',
      );
    }

    return {
      countryCode: countryCode.toUpperCase(),
      indicatorCode,
    };
  }

  
  /**
   * Recherche le pays et l'indicateur
   * correspondant à un series_id.
   */
  private async resolveSeries(seriesId: string) {
    const {
      countryCode,
      indicatorCode,
    } = this.parseSeriesId(seriesId);

    const country =
      await this.databaseService.country.findUnique({
        where: {
          code: countryCode,
        },
      });

    if (!country) {
      throw new NotFoundException(
        `Pays '${countryCode}' introuvable`,
      );
    }

    const indicator =
      await this.databaseService.macroIndicator.findUnique({
        where: {
          code: indicatorCode,
        },
      });

    if (!indicator) {
      throw new NotFoundException(
        `Indicateur '${indicatorCode}' introuvable`,
      );
    }

    return {
      country,
      indicator,
      countryCode,
      indicatorCode,
      seriesId,
    };
  }

  // ============================================================
  // 1. GET /explorer/indicators
  // ============================================================

  async getIndicators() {
    const indicators =
      await this.databaseService.macroIndicator.findMany({
        orderBy: {
          name: 'asc',
        },
      });

    return indicators.map((indicator) => ({
      code: indicator.code,
      name: indicator.name,
      source: indicator.source,
      frequency: indicator.frequency,
      unit: indicator.unit,
    }));
  }

  // ============================================================
  // 2. GET /explorer/series
  // ============================================================

  async getSeries(
    countryCode?: string,
    indicatorCode?: string,
  ) {
    const where: any = {};

    if (countryCode) {
      where.countryCode = countryCode.toUpperCase();
    }

    if (indicatorCode) {
      where.indicator = {
        code: indicatorCode,
      };
    }

    const data =
      await this.databaseService.macroData.findMany({
        where,

        include: {
          indicator: true,
          country: true,
        },

        orderBy: [
          {
            period: 'desc',
          },
          {
            vintageDate: 'desc',
          },
        ],
      });

    /**
     * Une série =
     *
     * country_code + indicator_code
     */
    const seriesMap = new Map<string, any>();

    for (const item of data) {
      const seriesId =
        `${item.countryCode}__${item.indicator.code}`;

      if (!seriesMap.has(seriesId)) {
        seriesMap.set(seriesId, {
          seriesId,

          country: {
            code: item.country.code,
            name: item.country.name,
          },

          indicator: {
            code: item.indicator.code,
            name: item.indicator.name,
            source: item.indicator.source,
            frequency: item.indicator.frequency,
            unit: item.indicator.unit,
          },

          observations: [],
        });
      }

      seriesMap.get(seriesId).observations.push(item);
    }

    return {
      total: seriesMap.size,
      data: Array.from(seriesMap.values()),
    };
  }

  // ============================================================
  // 3. GET /explorer/series/:id/vintages
  // ============================================================

  async getVintages(seriesId: string) {
    const { countryCode, indicator } =
      await this.resolveSeries(seriesId);
  
    const data = await this.databaseService.macroData.findMany({
      where: {
        countryCode,
        indicatorId: indicator.id,
      },
      orderBy: [
        {
          period: 'desc',
        },
        {
          vintageDate: 'desc',
        },
      ],
    });
  
    /**
     * On regroupe les données par vintageDate.
     */
    const vintages = data.map((item, index) => {
      const nextItem = data[index + 1];
  
      let change: number | null = null;
  
      if (
        nextItem &&
        nextItem.period.getTime() === item.period.getTime()
      ) {
        change =
          Number(item.value) -
          Number(nextItem.value);
      }
  
      return {
        vintageDate: item.vintageDate,
        value: item.value,
        change,
        period: item.period,
        isForecast: item.isForecast,
        isEstimate: item.isEstimate,
      };
    });
  
    return {
      seriesId,
      indicator: {
        code: indicator.code,
        name: indicator.name,
        source: indicator.source,
        frequency: indicator.frequency,
        unit: indicator.unit,
      },
      vintages,
    };
  }
  

  // ============================================================
  // 4. GET /explorer/series/:id/related
  // ============================================================

  async getRelated(seriesId: string) {
    const {
      indicator,
    } = await this.resolveSeries(seriesId);

    const correlations =
      await this.databaseService.indicatorCorrelation.findMany({
        where: {
          indicatorId: indicator.id,
        },

        include: {
          relatedIndicator: true,
        },

        orderBy: {
          correlation: 'desc',
        },
      });

    return {
      seriesId,

      indicator: {
        code: indicator.code,
        name: indicator.name,
      },

      related: correlations.map((item) => ({
        indicator: {
          code: item.relatedIndicator.code,
          name: item.relatedIndicator.name,
          source: item.relatedIndicator.source,
          frequency: item.relatedIndicator.frequency,
          unit: item.relatedIndicator.unit,
        },

        correlation: Number(item.correlation),

        periodYears: item.periodYears,
      })),
    };
  }

  // ============================================================
  // 5. GET /explorer/series/:id/quality
  // ============================================================

  async getQuality(seriesId: string) {
    const {
      countryCode,
      indicator,
    } = await this.resolveSeries(seriesId);

    const quality =
      await this.databaseService.dataQuality.findFirst({
        where: {
          countryCode,
          indicatorId: indicator.id,
        },

        orderBy: {
          period: 'desc',
        },
      });

    if (!quality) {
      return {
        sourceReliability: null,
        timeliness: null,
        coverage: null,
        revisionVolatility: null,
        breaksStructuralChanges: null,
        overallScore: null,
        period: null,
      };
    }

    return {
      sourceReliability:
        quality.sourceReliability,

      timeliness:
        quality.timeliness,

      coverage:
        quality.coverage,

      revisionVolatility:
        quality.revisionVolatility,

      breaksStructuralChanges:
        quality.breaksStructuralChanges,

      overallScore:
        Number(quality.overallScore),

      period:
        quality.period,
    };
  }

  // ============================================================
  // 6. GET /explorer/series/:id/export
  // ============================================================

  async exportSeries(
    seriesId: string,
    format: string,
  ) {
    const {
      countryCode,
      indicator,
    } = await this.resolveSeries(seriesId);

    const data =
      await this.databaseService.macroData.findMany({
        where: {
          countryCode,
          indicatorId: indicator.id,
        },

        orderBy: {
          period: 'asc',
        },
      });

    const rows = data.map((item) => ({
      seriesId,

      countryCode,

      indicatorCode:
        indicator.code,

      period:
        item.period,

      vintageDate:
        item.vintageDate,

      value:
        item.value,

      isForecast:
        item.isForecast,

      isEstimate:
        item.isEstimate,
    }));

    if (format === 'json') {
      return {
        seriesId,

        indicator: {
          code: indicator.code,
          name: indicator.name,
          source: indicator.source,
          frequency: indicator.frequency,
          unit: indicator.unit,
        },

        data: rows,
      };
    }

    if (format === 'csv') {
      return this.buildCsv(rows);
    }

    if (format === 'excel') {
      /**
       * Pour Excel, on pourra ajouter exceljs/openpyxl
       * selon la stratégie retenue pour le projet.
       */
      throw new BadRequestException(
        'Le format Excel nécessite la configuration du générateur XLSX.',
      );
    }

    throw new BadRequestException(
      `Format '${format}' non supporté. Formats disponibles : csv, json, excel.`,
    );
  }

  // ============================================================
  // CSV
  // ============================================================

  private buildCsv(rows: any[]) {
    const headers = [
      'seriesId',
      'countryCode',
      'indicatorCode',
      'period',
      'vintageDate',
      'value',
      'isForecast',
      'isEstimate',
    ];

    const lines = [
      headers.join(','),

      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header];

            if (
              value === null ||
              value === undefined
            ) {
              return '';
            }

            const stringValue =
              value instanceof Date
                ? value.toISOString()
                : String(value);

            return `"${stringValue.replace(
              /"/g,
              '""',
            )}"`;
          })
          .join(','),
      ),
    ];

    return lines.join('\n');
  }
}
