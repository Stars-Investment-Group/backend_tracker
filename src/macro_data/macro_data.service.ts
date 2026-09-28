import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateMacroDatumDto, MacroDataQueryDto } from './dto/create-macro_datum.dto';
import { UpdateMacroDatumDto } from './dto/update-macro_datum.dto';

@Injectable()
export class MacroDataService {

  constructor(private readonly databaseService: DatabaseService) {}



  async findAll(query: MacroDataQueryDto) {
    const where: any = {};

    if (query.country) {
      where.countryCode = query.country.toUpperCase();
    }

    if (query.indicator) {
      where.indicator = {
        code: query.indicator.toLowerCase(),
      };
    }

    if (query.from || query.to) {
      where.period = {};

      if (query.from) {
        where.period.gte = new Date(query.from);
      }

      if (query.to) {
        where.period.lte = new Date(query.to);
      }
    }

    return this.databaseService.macroData.findMany({
      where,
      include: {
        country: {
          select: {
            code: true,
            name: true,
          },
        },
        indicator: {
          select: {
            code: true,
            name: true,
            category: true,
            unit: true,
          },
        },
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
  }

  async findLatest() {
    const data = await this.databaseService.macroData.findMany({
      orderBy: [
        {
          countryCode: 'asc',
        },
        {
          indicatorId: 'asc',
        },
        {
          period: 'desc',
        },
        {
          vintageDate: 'desc',
        },
      ],
      include: {
        country: {
          select: {
            code: true,
            name: true,
          },
        },
        indicator: {
          select: {
            code: true,
            name: true,
            category: true,
            unit: true,
          },
        },
      },
    });

    // Une seule dernière valeur par pays + indicateur
    const latest = new Map<string, (typeof data)[number]>();

    for (const item of data) {
      const key = `${item.countryCode}:${item.indicatorId}`;

      if (!latest.has(key)) {
        latest.set(key, item);
      }
    }

    return Array.from(latest.values());
  }

  async findSeries(countryCode: string, indicatorCode: string) {
    const country = await this.databaseService.country.findUnique({
      where: {
        code: countryCode.toUpperCase(),
      },
    });

    if (!country) {
      throw new NotFoundException(
        `Country "${countryCode}" not found`,
      );
    }

    const indicator =
      await this.databaseService.macroIndicator.findUnique({
        where: {
          code: indicatorCode.toLowerCase(),
        },
      });

    if (!indicator) {
      throw new NotFoundException(
        `Indicator "${indicatorCode}" not found`,
      );
    }

    const data = await this.databaseService.macroData.findMany({
      where: {
        countryCode: country.code,
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

    return {
      countryCode: country.code,
      countryName: country.name,
      indicatorCode: indicator.code,
      indicatorName: indicator.name,
      series: data,
    };
  }

  async findVintages(
    countryCode: string,
    indicatorCode: string,
  ) {
    const country = await this.databaseService.country.findUnique({
      where: {
        code: countryCode.toUpperCase(),
      },
    });

    if (!country) {
      throw new NotFoundException(
        `Country "${countryCode}" not found`,
      );
    }

    const indicator =
      await this.databaseService.macroIndicator.findUnique({
        where: {
          code: indicatorCode.toLowerCase(),
        },
      });

    if (!indicator) {
      throw new NotFoundException(
        `Indicator "${indicatorCode}" not found`,
      );
    }

    return this.databaseService.macroData.findMany({
      where: {
        countryCode: country.code,
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
  }

  async create(dto: CreateMacroDatumDto) {
    const country = await this.databaseService.country.findUnique({
      where: {
        code: dto.countryCode.toUpperCase(),
      },
    });

    if (!country) {
      throw new BadRequestException(
        `Country "${dto.countryCode}" does not exist`,
      );
    }

    const indicator =
      await this.databaseService.macroIndicator.findUnique({
        where: {
          id: dto.indicatorId,
        },
      });

    if (!indicator) {
      throw new BadRequestException(
        `Indicator "${dto.indicatorId}" does not exist`,
      );
    }

    return this.databaseService.macroData.create({
      data: {
        countryCode: country.code,
        indicatorId: indicator.id,
        vintageDate: new Date(dto.vintageDate),
        period: new Date(dto.period),
        value: dto.value,
        isForecast: dto.isForecast ?? false,
        isEstimate: dto.isEstimate ?? false,
        releaseDate: dto.releaseDate
          ? new Date(dto.releaseDate)
          : undefined,
        nextReleaseDate: dto.nextReleaseDate
          ? new Date(dto.nextReleaseDate)
          : undefined,
        source: dto.source,
      },
      include: {
        country: true,
        indicator: true,
      },
    });
  }
}
