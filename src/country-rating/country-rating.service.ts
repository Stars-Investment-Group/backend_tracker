import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateCountryRatingDto } from './dto/create-country-rating.dto';
import { UpdateCountryRatingDto } from './dto/update-country-rating.dto';

@Injectable()
export class CountryRatingService {

  constructor(private readonly databaseservice: DatabaseService) {}


  /**
   * Retourne la notation actuelle d'un pays.
   *
   */
  async findCurrent(countryCode: string) {
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

    const rating = await this.databaseservice.countryRating.findFirst({
      where: {
        countryCode: code,
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });

    if (!rating) {
      throw new NotFoundException(
        `No rating found for country "${code}"`,
      );
    }

    return this.formatRating(rating, country.name);
  }

  /**
   * Historique complet des notations.
   */
  async findHistory(countryCode: string) {
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

    const ratings =
      await this.databaseservice.countryRating.findMany({
        where: {
          countryCode: code,
        },
        orderBy: {
          reviewDate: 'desc',
        },
      });

    return ratings.map((rating) =>
      this.formatRating(rating, country.name),
    );
  }

  /**
   * Scores des différents piliers.
   */
  async findPillars(countryCode: string) {
    const rating = await this.getCurrentRating(
      countryCode,
    );

    return {
      countryCode: rating.countryCode,
      overallScore: rating.overallScore,
      rating: rating.rating,
      pillars: rating.pillarScores,
      reviewDate: rating.reviewDate,
    };
  }

  /**
   * Drivers positifs et négatifs.
   */
  async findDrivers(countryCode: string) {
    const rating = await this.getCurrentRating(
      countryCode,
    );

    return {
      countryCode: rating.countryCode,
      rating: rating.rating,
      positiveDrivers: rating.positiveDrivers ?? [],
      negativeDrivers: rating.negativeDrivers ?? [],
      reviewDate: rating.reviewDate,
    };
  }

  /**
   * Déclencheurs d'upgrade et de downgrade.
   */
  async findTriggers(countryCode: string) {
    const rating = await this.getCurrentRating(
      countryCode,
    );

    return {
      countryCode: rating.countryCode,
      rating: rating.rating,
      upgradeTriggers: rating.upgradeTriggers ?? [],
      downgradeTriggers:
        rating.downgradeTriggers ?? [],
      reviewDate: rating.reviewDate,
    };
  }

  /**
   * Récupère la notation actuelle.
   */
  private async getCurrentRating(countryCode: string) {
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

    const rating = await this.databaseservice.countryRating.findFirst({
      where: {
        countryCode: code,
      },
      orderBy: {
        reviewDate: 'desc',
      },
    });

    if (!rating) {
      throw new NotFoundException(
        `No rating found for country "${code}"`,
      );
    }

    return rating;
  }

  
  /**
   * Formate la réponse API.
   */
  private formatRating(
    rating: any,
    countryName?: string,
  ) {
    return {
      countryCode: rating.countryCode,
      ...(countryName
        ? {
            countryName,
          }
        : {}),
      overallScore: Number(rating.overallScore),
      rating: rating.rating,
      pillars: rating.pillarScores,
      positiveDrivers: rating.positiveDrivers ?? [],
      negativeDrivers: rating.negativeDrivers ?? [],
      upgradeTriggers: rating.upgradeTriggers ?? [],
      downgradeTriggers:
        rating.downgradeTriggers ?? [],
      reviewDate: rating.reviewDate,
    };
  }
}
