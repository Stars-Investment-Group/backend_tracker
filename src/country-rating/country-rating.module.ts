import { Module } from '@nestjs/common';
import { CountryRatingService } from './country-rating.service';
import { CountryRatingController } from './country-rating.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CountryRatingController],
  providers: [CountryRatingService],
  exports: [CountryRatingService]
})
export class CountryRatingModule {}
