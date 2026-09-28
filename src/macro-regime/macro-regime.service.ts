import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateMacroRegimeDto } from './dto/create-macro-regime.dto';
import { UpdateMacroRegimeDto } from './dto/update-macro-regime.dto';

@Injectable()
export class MacroRegimeService {

  constructor(private readonly databaseservice: DatabaseService) {}


  create(createMacroRegimeDto: CreateMacroRegimeDto) {
    return 'This action adds a new macroRegime';
  }

  /**
   * Liste les régimes actuellement disponibles.
   */
  async findAll() {
    return this.databaseservice.macroRegime.findMany({
      orderBy: [
        {
          regime: 'asc',
        },
        {
          validFrom: 'desc',
        },
      ],
      include: {
        country: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Retourne le régime actuel d'un pays.
   */
  async findCurrentByCountry(countryCode: string) {
    const code = countryCode.toUpperCase();

    const country = await this.databaseservice.country.findUnique({
      where: {
        code,
      },
    });

    if (!country) {
      throw new NotFoundException(
        `Country "${code}" not found`,
      );
    }

    const regime = await this.databaseservice.macroRegime.findFirst({
      where: {
        countryCode: code,
        OR: [
          {
            validTo: null,
          },
          {
            validTo: {
              gte: new Date(),
            },
          },
        ],
      },
      orderBy: {
        validFrom: 'desc',
      },
      include: {
        country: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    if (!regime) {
      throw new NotFoundException(
        `No current macro regime found for "${code}"`,
      );
    }

    return regime;
  }

  /**
   * Vue globale des régimes actuels.
   */
  async findGlobal() {
    const regimes = await this.databaseservice.macroRegime.findMany({
      where: {
        OR: [
          {
            validTo: null,
          },
          {
            validTo: {
              gte: new Date(),
            },
          },
        ],
      },
      orderBy: {
        countryCode: 'asc',
      },
      include: {
        country: {
          select: {
            code: true,
            name: true,
            region: true,
          },
        },
      },
    });

    return regimes;
  }

  /**
   * Calcul du régime.
   */
  async calculate(countryCode: string) {
    const code = countryCode.toUpperCase();

    const country = await this.databaseservice.country.findUnique({
      where: {
        code,
      },
    });

    if (!country) {
      throw new NotFoundException(
        `Country "${code}" not found`,
      );
    }

    return {
      countryCode: code,
      message:
        'Le regime calculate n est pas encore défini',
    };
  }
}
