import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateGlobalKpiDto } from './dto/create-global-kpi.dto';
import { UpdateGlobalKpiDto } from './dto/update-global-kpi.dto';


@Injectable()
export class GlobalKpiService {

  constructor(private readonly databaseService: DatabaseService) {}


  async getKpis() {
    return this.databaseService.globalKpi.findMany({
      orderBy: [
        {
          period: 'desc',
        },
        {
          kpiCode: 'asc',
        },
      ],
    });
  }

  async getHouseView() {
    return this.databaseService.houseView.findFirst({
      orderBy: {
        period: 'desc',
      },
    });
  }

  async getRiskIndex() {
    return this.databaseService.globalKpi.findFirst({
      where: {
        kpiCode: 'risk_index',
      },
      orderBy: {
        period: 'desc',
      },
    });
  }

  async getMovers() {
    const ratings = await this.databaseService.countryRating.findMany({
      include: {
        country: {
          select: {
            code: true,
            name: true,
            region: true,
          },
        },
      },
      orderBy: [
        {
          countryCode: 'asc',
        },
        {
          reviewDate: 'desc',
        },
      ],
    });

    const ratingsByCountry = new Map<string, typeof ratings>();

    for (const rating of ratings) {
      const existing = ratingsByCountry.get(rating.countryCode) ?? [];

      if (existing.length < 2) {
        existing.push(rating);
        ratingsByCountry.set(rating.countryCode, existing);
      }
    }

    //const movers = [];
    const movers: Array<{
      countryCode: string;
      countryName: string;
      region: string | null;
      currentScore: number;
      previousScore: number;
      change: number;
      direction: 'up' | 'down' | 'stable';
      reviewDate: Date;
    }> = [];

    for (const [countryCode, countryRatings] of ratingsByCountry) {
      if (countryRatings.length < 2) {
        continue;
      }

      const latest = countryRatings[0];
      const previous = countryRatings[1];

      const latestScore = Number(latest.overallScore);
      const previousScore = Number(previous.overallScore);

      const change = latestScore - previousScore;

      movers.push({
        countryCode,
        countryName: latest.country.name,
        region: latest.country.region,
        currentScore: latestScore,
        previousScore,
        change,
        direction:
          change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        reviewDate: latest.reviewDate,
      });
    }

    movers.sort(
      (a, b) => Math.abs(b.change) - Math.abs(a.change),
    );

    return {
      movers: movers.slice(0, 10),
    };
  }

  async getHeatmap() {
    const ratings = await this.databaseService.countryRating.findMany({
      include: {
        country: {
          select: {
            code: true,
            name: true,
            region: true,
          },
        },
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });

    const latestByCountry = new Map<
      string,
      (typeof ratings)[number]
    >();

    for (const rating of ratings) {
      if (!latestByCountry.has(rating.countryCode)) {
        latestByCountry.set(rating.countryCode, rating);
      }
    }

    const regions = new Map<
      string,
      {
        totalScore: number;
        countries: number;
      }
    >();

    for (const rating of latestByCountry.values()) {
      const region = rating.country.region;

      if (!region) {
        continue;
      }

      const existing = regions.get(region) ?? {
        totalScore: 0,
        countries: 0,
      };

      existing.totalScore += Number(rating.overallScore);
      existing.countries += 1;

      regions.set(region, existing);
    }

    const heatmap = Array.from(regions.entries()).map(
      ([region, data]) => ({
        region,
        riskScore: Number(
          (100 - data.totalScore / data.countries).toFixed(2),
        ),
        averageRatingScore: Number(
          (data.totalScore / data.countries).toFixed(2),
        ),
        countries: data.countries,
      }),
    );

    heatmap.sort((a, b) => b.riskScore - a.riskScore);

    return {
      heatmap,
    };
  }
}
