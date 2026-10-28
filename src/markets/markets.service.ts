import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';

@Injectable()
export class MarketsService {

  constructor(private readonly databaseService: DatabaseService) {}


  async getSummary() {
    const [globalMood, topAssets, marketHours] = await Promise.all([
      this.databaseService.marketCondition.findFirst({
        where: {
          indicatorCode: {
            in: ['GLOBAL_MOOD', 'GLOBAL_SENTIMENT', 'GLOBAL_RISK_SENTIMENT'],
          },
        },
        orderBy: [
          { period: 'desc' },
          { createdAt: 'desc' },
        ],
      }),

      this.databaseService.marketIndex.findMany({
        where: {
          currentValue: { not: null },
        },
        orderBy: {
          lastUpdated: 'desc',
        },
        take: 5,
      }),

      this.databaseService.marketHours.findMany({
        where: { isActive: true },
        orderBy: { market: 'asc' },
      }),
    ]);

    return {
      globalMood: globalMood
        ? {
            status: globalMood.status,
            // La valeur n'est pas automatiquement un score sur 10.
            // On ne la convertit en score que si le code le précise.
            score:
              globalMood.indicatorCode.toUpperCase().includes('SCORE') &&
              globalMood.value !== null
                ? Number(globalMood.value)
                : null,
            maxScore: 10,
            indicatorCode: globalMood.indicatorCode,
            period: globalMood.period,
          }
        : null,

      topAssets: topAssets.map((asset) => ({
        code: asset.code,
        name: asset.name,
        value:
          asset.currentValue !== null
            ? Number(asset.currentValue)
            : null,
        unit: asset.unit ?? asset.currency ?? null,
        change:
          asset.dailyChange !== null
            ? Number(asset.dailyChange)
            : null,
        lastUpdated: asset.lastUpdated,
      })),

      marketHours: marketHours.map((market) => ({
        market: market.market,
        open: market.open,
        close: market.close,
        timezone: market.timezone,
      })),
    };
  }

  async getIndices(filters: {
    category?: string;
    region?: string;
    countryCode?: string;
  }) {
    const indices = await this.databaseService.marketIndex.findMany({
      where: {
        ...(filters.category && { category: filters.category }),
        ...(filters.region && { region: filters.region }),
        ...(filters.countryCode && {
          countryCode: filters.countryCode.toUpperCase(),
        }),
      },
      orderBy: { lastUpdated: 'desc' },
    });

    return indices.map((index) => ({
      ...index,
      currentValue:
        index.currentValue !== null
          ? Number(index.currentValue)
          : null,
      dailyChange:
        index.dailyChange !== null
          ? Number(index.dailyChange)
          : null,
      dailyChangeAbs:
        index.dailyChangeAbs !== null
          ? Number(index.dailyChangeAbs)
          : null,
    }));
  }

  async getYields(filters: {
    countryCode?: string;
    maturity?: string;
  }) {
    const yields = await this.databaseService.sovereignYield.findMany({
      where: {
        ...(filters.countryCode && {
          countryCode: filters.countryCode.toUpperCase(),
        }),
        ...(filters.maturity && {
          maturity: filters.maturity,
        }),
      },
      orderBy: [
        { period: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    });

    return yields.map((item) => ({
      ...item,
      yieldRate:
        item.yieldRate !== null ? Number(item.yieldRate) : null,
      changeBps:
        item.changeBps !== null ? Number(item.changeBps) : null,
    }));
  }

  async getCommodities() {
    const commodities = await this.databaseService.marketIndex.findMany({
      where: {
        category: 'commodity',
      },
      orderBy: { lastUpdated: 'desc' },
    });

    return commodities.map((item) => ({
      code: item.code,
      name: item.name,
      value:
        item.currentValue !== null
          ? Number(item.currentValue)
          : null,
      unit: item.unit ?? item.currency ?? null,
      change:
        item.dailyChange !== null
          ? Number(item.dailyChange)
          : null,
      changeAbsolute:
        item.dailyChangeAbs !== null
          ? Number(item.dailyChangeAbs)
          : null,
      lastUpdated: item.lastUpdated,
    }));
  }

  async getConditions() {
    const conditions = await this.databaseService.marketCondition.findMany({
      orderBy: [
        { period: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    });

    return conditions.map((item) => ({
      ...item,
      value: item.value !== null ? Number(item.value) : null,
    }));
  }

  async getMarketHours() {
    return this.databaseService.marketHours.findMany({
      where: { isActive: true },
      orderBy: { market: 'asc' },
    });
  }
}
