import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionsService {

  constructor(private readonly databaseService: DatabaseService) {}


  async getRegions() {
    const snapshots = await this.databaseService.regionSnapshot.findMany({
      orderBy: [
        {
          regionName: 'asc',
        },
        {
          period: 'desc',
        },
      ],
    });

    const regions = new Map<string, (typeof snapshots)[number]>();

    for (const snapshot of snapshots) {
      if (!regions.has(snapshot.regionCode)) {
        regions.set(snapshot.regionCode, snapshot);
      }
    }

    return Array.from(regions.values()).map((region) => ({
      regionCode: region.regionCode,
      regionName: region.regionName,
      overallScore: region.overallScore
        ? Number(region.overallScore)
        : null,
      momentum: region.momentum,
      riskScore: region.riskScore
        ? Number(region.riskScore)
        : null,
      period: region.period,
    }));
  }

  async getSnapshot(code: string) {
    const snapshot = await this.databaseService.regionSnapshot.findFirst({
      where: {
        regionCode: code.toUpperCase(),
      },
      orderBy: {
        period: 'desc',
      },
    });

    if (!snapshot) {
      throw new NotFoundException(
        `Aucun snapshot trouvé pour la région ${code}`,
      );
    }

    return {
      regionCode: snapshot.regionCode,
      regionName: snapshot.regionName,
      overallScore: snapshot.overallScore
        ? Number(snapshot.overallScore)
        : null,
      momentum: snapshot.momentum,
      riskScore: snapshot.riskScore
        ? Number(snapshot.riskScore)
        : null,
      pillarScores: snapshot.pillarScores,
      period: snapshot.period,
    };
  }

  async getCountries(code: string) {
    const regionCode = code.toUpperCase();

    const countries = await this.databaseService.country.findMany({
      where: {
        region: regionCode,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      regionCode,
      countries,
    };
  }

  async getHeatmap(code: string) {
    const snapshot = await this.databaseService.regionSnapshot.findFirst({
      where: {
        regionCode: code.toUpperCase(),
      },
      orderBy: {
        period: 'desc',
      },
    });

    if (!snapshot) {
      throw new NotFoundException(
        `Aucun snapshot trouvé pour la région ${code}`,
      );
    }

    return {
      regionCode: snapshot.regionCode,
      regionName: snapshot.regionName,
      period: snapshot.period,
      heatmap: snapshot.pillarScores,
    };
  }
}
