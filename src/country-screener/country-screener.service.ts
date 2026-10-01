import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCountryScreenerDto } from './dto/create-country-screener.dto';
import { UpdateCountryScreenerDto } from './dto/update-country-screener.dto';


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

  constructor(private readonly databaseservice: DatabaseService) {}


  async findCountries(
    query: CreateCountryScreenerDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const countries = await this.databaseservice.country.findMany({
      where: {
        ...(query.region
          ? {
              region: query.region,
            }
          : {}),

        ...(query.incomeLevel
          ? {
              incomeLevel: query.incomeLevel,
            }
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

    const rows: ScreenerRow[] = [];

    for (const country of countries) {
      const growth = await this.getLatestIndicatorValue(
        country.code,
        'real_gdp_growth',
      );

      const inflation = await this.getLatestIndicatorValue(
        country.code,
        'inflation_rate',
      );

      const rating =
        await this.databaseservice.countryRating.findFirst({
          where: {
            countryCode: country.code,
          },
          orderBy: {
            reviewDate: 'desc',
          },
          select: {
            overallScore: true,
          },
        });

      const regime =
        await this.databaseservice.macroRegime.findFirst({
          where: {
            countryCode: country.code,
          },
          orderBy: {
            validFrom: 'desc',
          },
          select: {
            momentum: true,
            regime: true,
          },
        });

      const row: ScreenerRow = {
        countryCode: country.code,
        countryName: country.name,
        region: country.region,
        incomeLevel: country.incomeLevel,
        growth,
        inflation,
        overallScore: rating
          ? Number(rating.overallScore)
          : null,
        outlook: regime?.momentum ?? null,
        trend: this.getTrend(regime?.momentum),
      };

      if (
        query.minGrowth !== undefined &&
        (row.growth === null ||
          row.growth < query.minGrowth)
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
    const end = start + limit;

    const paginated = rows
      .slice(start, end)
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

  private async getLatestIndicatorValue(
    countryCode: string,
    indicatorCode: string,
  ): Promise<number | null> {
    const indicator =
      await this.databaseservice.macroIndicator.findUnique({
        where: {
          code: indicatorCode,
        },
        select: {
          id: true,
        },
      });

    if (!indicator) {
      return null;
    }

    const data = await this.databaseservice.macroData.findFirst({
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
      select: {
        value: true,
      },
    });

    return data ? Number(data.value) : null;
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

      if (valueA === null && valueB === null) {
        return 0;
      }

      if (valueA === null) {
        return 1;
      }

      if (valueB === null) {
        return -1;
      }

      if (
        typeof valueA === 'string' &&
        typeof valueB === 'string'
      ) {
        return order === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      const comparison =
        Number(valueA) - Number(valueB);

      return order === 'asc'
        ? comparison
        : -comparison;
    });
  }
}
