import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';

@Injectable()
export class IndicatorsService {

  constructor(private readonly databaseServive: DatabaseService) {}


  /**
   * GET /indicators
   *
   * Liste tous les indicateurs.
   */
  async findAll() {
    return this.databaseServive.macroIndicator.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * GET /indicators/:code
   *
   * Retourne un indicateur par son code.
   */
  async findOne(code: string) {
    const indicator = await this.databaseServive.macroIndicator.findUnique({
      where: {
        code: code.toLowerCase(),
      },
    });

    if (!indicator) {
      throw new NotFoundException(
        `Indicator with code "${code}" not found`,
      );
    }

    return indicator;
  }

   /**
   * GET /indicators/categories
   *
   * Retourne les catégories distinctes.
   */
   async findCategories() {
    const result = await this.databaseServive.macroIndicator.findMany({
      where: {
        category: {
          not: null,
        },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    });

    return result
      .map((item) => item.category)
      .filter(
        (category): category is string => category !== null,
      );
  }
}
