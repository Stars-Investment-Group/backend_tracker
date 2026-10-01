import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';
import { CountryRatingService } from './country-rating.service';
import { CreateCountryRatingDto } from './dto/create-country-rating.dto';
import { UpdateCountryRatingDto } from './dto/update-country-rating.dto';



@ApiTags('Country Rating')
@Controller('country-rating')
export class CountryRatingController {
  constructor(private readonly countryRatingService: CountryRatingService) {}

  /**
   * GET /ratings/:country
   */
  @Public()
  @Get(':country')
  @ApiOperation({
    summary: 'Notation actuel d\'un pays',
    description: 'Retourne la notation actuelle d\'un pays',
  })
  @ApiResponse({
    status: 200,
    description: 'Notation d\'un pays retournée avec succès',
  })
  findCurrent(
    @Param('country') country: string,
  ) {
    return this.countryRatingService.findCurrent(
      country,
    );
  }

  /**
   * GET /ratings/:country/history
   */
  @Public()
  @Get(':country/history')
  @ApiOperation({
    summary: 'Historique des notations',
    description: 'Retourne l\'historique des notations',
  })
  @ApiResponse({
    status: 200,
    description: 'Historique retournée avec succès',
  })
  findHistory(
    @Param('country') country: string,
  ) {
    return this.countryRatingService.findHistory(
      country,
    );
  }

  /**
   * GET /ratings/:country/pillars
   */
  @Public()
  @Get(':country/pillars')
  @ApiOperation({
    summary: 'Scores par pilier',
    description: 'Retourne scores par pilier',
  })
  @ApiResponse({
    status: 200,
    description: 'scores retournés avec succès',
  })
  findPillars(
    @Param('country') country: string,
  ) {
    return this.countryRatingService.findPillars(
      country,
    );
  }

  /**
   * GET /ratings/:country/drivers
   */
  @Public()
  @Get(':country/drivers')
  @ApiOperation({
    summary: 'Drivers positifs et négatifs',
    description: 'Retourne Drivers positifs et négatifs',
  })
  @ApiResponse({
    status: 200,
    description: 'drivers retournés avec succès',
  })
  findDrivers(
    @Param('country') country: string,
  ) {
    return this.countryRatingService.findDrivers(
      country,
    );
  }

  /**
   * GET /ratings/:country/triggers
   */
  @Public()
  @Get(':country/triggers')
  @ApiOperation({
    summary: 'Déclencheurs d\'upgrade et de downgrade',
    description: 'Retourne Déclencheurs',
  })
  @ApiResponse({
    status: 200,
    description: 'Déclencheurs retournés avec succès',
  })
  findTriggers(
    @Param('country') country: string,
  ) {
    return this.countryRatingService.findTriggers(
      country,
    );
  }
}
