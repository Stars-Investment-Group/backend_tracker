import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {

  constructor(private readonly databaseService: DatabaseService) {}


  create(createCountryDto: CreateCountryDto) {
    return 'This action adds a new country';
  }

  /**
   * Liste les pays avec filtres optionnels.
   */
  async findAll(createCountryDto: CreateCountryDto) {
    const where: any = {};

    if (createCountryDto.region) {
      where.region = createCountryDto.region;
    }

    if (createCountryDto.income) {
      where.incomeLevel = createCountryDto.income;
    }

    return this.databaseService.country.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Retourne un pays par son code ISO alpha-3
   * ou par un code d'agrégat.
   */
  async findOne(code: string) {
    const country = await this.databaseService.country.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

    if (!country) {
      throw new NotFoundException(
        `Country with code "${code}" not found`,
      );
    }

    return country;
  }

    /**
   * Retourne la liste des régions distinctes.
   */
    async findRegions() {
      const result = await this.databaseService.country.findMany({
        where: {
          region: {
            not: null,
          },
        },
        select: {
          region: true,
        },
        distinct: ['region'],
        orderBy: {
          region: 'asc',
        },
      });
  
      return result
        .map((item) => item.region)
        .filter((region): region is string => region !== null);
    }

   /**
   * Vue d'ensemble d'un pays.
   */
   async getOverview(code: string) {
    const country = await this.databaseService.country.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

    if (!country) {
      throw new NotFoundException(
        `Country with code "${code}" not found`,
      );
    }

    return {
      code: country.code,
      name: country.name,
      region: country.region,
      subregion: country.subregion,
      incomeLevel: country.incomeLevel,
      currency: country.currency,
      latitude: country.latitude,
      longitude: country.longitude,
      flagUrl: country.flagUrl,
      isAggregate: country.isAggregate,
    };
  }
}
