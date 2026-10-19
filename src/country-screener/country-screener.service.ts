
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCountryScreenerDto } from './dto/create-country-screener.dto';

interface ScreenerRow {
  countryCode: string;
  countryName: string;
  region: string | null;
  incomeLevel: string | null;
  growth: number | null;
  inflation: number | null;
  overallScore: number | null;
  outlook: string | null;
  trend: string | null;
}

@Injectable()
export class CountryScreenerService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async findCountries(query: CreateCountryScreenerDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const countries = await this.databaseService.country.findMany({
      where: {
        ...(query.region ? { region: query.region } : {}),
        ...(query.incomeLevel
          ? { incomeLevel: query.incomeLevel }
          : {}),
      },
      select: {
        code: true,
        name: true,
        region: true,
        incomeLevel: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (countries.length === 0) {
      return {
        data: [],
        pagination: { page, limit, total: 0 },
      };
    }

    const countryCodes = countries.map((country) => country.code);

    // Charger le catalogue une seule fois.
    const indicators = await this.databaseService.macroIndicator.findMany({
      where: {
        code: {
          in: ['real_gdp_growth', 'cpi_inflation'],
        },
      },
      select: {
        id: true,
        code: true,
      },
    });

    const growthIndicator = indicators.find(
      (indicator) => indicator.code === 'real_gdp_growth',
    );

    const inflationIndicator = indicators.find(
      (indicator) => indicator.code === 'cpi_inflation',
    );

    const indicatorIds = indicators.map((indicator) => indicator.id);

    // Charger les données macro, notations et régimes en parallèle.
    const [macroData, ratings, regimes] = await Promise.all([
      indicatorIds.length > 0
        ? this.databaseService.macroData.findMany({
            where: {
              countryCode: { in: countryCodes },
              indicatorId: { in: indicatorIds },
            },
            orderBy: [
              { countryCode: 'asc' },
              { indicatorId: 'asc' },
              { period: 'desc' },
              { vintageDate: 'desc' },
            ],
            select: {
              countryCode: true,
              indicatorId: true,
              period: true,
              vintageDate: true,
              value: true,
            },
          })
        : Promise.resolve([]),

      this.databaseService.countryRating.findMany({
        where: {
          countryCode: { in: countryCodes },
        },
        orderBy: [
          { countryCode: 'asc' },
          { reviewDate: 'desc' },
        ],
        select: {
          countryCode: true,
          reviewDate: true,
          overallScore: true,
        },
      }),

      this.databaseService.macroRegime.findMany({
        where: {
          countryCode: { in: countryCodes },
        },
        orderBy: [
          { countryCode: 'asc' },
          { validFrom: 'desc' },
        ],
        select: {
          countryCode: true,
          validFrom: true,
          momentum: true,
          regime: true,
        },
      }),
    ]);

    // Conserver la première observation de chaque série :
    // période la plus récente, puis millésime le plus récent.
    const latestMacro = new Map<string, number>();

    for (const item of macroData) {
      const key = `${item.countryCode}:${item.indicatorId}`;

      if (!latestMacro.has(key)) {
        latestMacro.set(key, Number(item.value));
      }
    }

    const latestRatings = new Map<string, number>();

    for (const rating of ratings) {
      if (!latestRatings.has(rating.countryCode)) {
        latestRatings.set(
          rating.countryCode,
          Number(rating.overallScore),
        );
      }
    }

    const latestRegimes = new Map<
      string,
      { momentum: string | null; regime: string }
    >();

    for (const regime of regimes) {
      if (!latestRegimes.has(regime.countryCode)) {
        latestRegimes.set(regime.countryCode, {
          momentum: regime.momentum,
          regime: regime.regime,
        });
      }
    }

    const rows: ScreenerRow[] = [];

    for (const country of countries) {
      const growth =
        growthIndicator
          ? latestMacro.get(
              `${country.code}:${growthIndicator.id}`,
            ) ?? null
          : null;

      const inflation =
        inflationIndicator
          ? latestMacro.get(
              `${country.code}:${inflationIndicator.id}`,
            ) ?? null
          : null;

      const rating = latestRatings.get(country.code);
      const regime = latestRegimes.get(country.code);

      const row: ScreenerRow = {
        countryCode: country.code,
        countryName: country.name,
        region: country.region,
        incomeLevel: country.incomeLevel,
        growth,
        inflation,
        overallScore: rating ?? null,
        outlook: regime?.momentum ?? null,
        trend: this.getTrend(regime?.momentum),
      };

      if (
        query.minGrowth !== undefined &&
        (row.growth === null || row.growth < query.minGrowth)
      ) {
        continue;
      }

      if (
        query.maxInflation !== undefined &&
        (row.inflation === null ||
          row.inflation > query.maxInflation)
      ) {
        continue;
      }

      if (
        query.minRating !== undefined &&
        (row.overallScore === null ||
          row.overallScore < query.minRating)
      ) {
        continue;
      }

      rows.push(row);
    }

    this.sortRows(
      rows,
      query.sortBy ?? 'overallScore',
      query.order ?? 'desc',
    );

    const total = rows.length;
    const start = (page - 1) * limit;

    const paginated = rows
      .slice(start, start + limit)
      .map((row, index) => ({
        rank: start + index + 1,
        ...row,
      }));

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getRankings(query: CreateCountryScreenerDto) {
    const result = await this.findCountries({
      ...query,
      page: 1,
      limit: 100,
    });

    return result.data;
  }

  private getTrend(
    momentum: string | null | undefined,
  ): string | null {
    if (!momentum) {
      return null;
    }

    switch (momentum.toLowerCase()) {
      case 'improving':
        return 'up';
      case 'deteriorating':
        return 'down';
      case 'stable':
        return 'stable';
      default:
        return null;
    }
  }

  private sortRows(
    rows: ScreenerRow[],
    sortBy: string,
    order: 'asc' | 'desc',
  ) {
    rows.sort((a, b) => {
      let valueA: string | number | null = null;
      let valueB: string | number | null = null;

      switch (sortBy) {
        case 'growth':
          valueA = a.growth;
          valueB = b.growth;
          break;
        case 'inflation':
          valueA = a.inflation;
          valueB = b.inflation;
          break;
        case 'countryName':
          valueA = a.countryName;
          valueB = b.countryName;
          break;
        case 'overallScore':
        default:
          valueA = a.overallScore;
          valueB = b.overallScore;
          break;
      }

      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return 1;
      if (valueB === null) return -1;

      if (
        typeof valueA === 'string' &&
        typeof valueB === 'string'
      ) {
        return order === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      const comparison = Number(valueA) - Number(valueB);
      return order === 'asc' ? comparison : -comparison;
    });
  }
}