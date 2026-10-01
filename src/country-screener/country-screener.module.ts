import { Module } from '@nestjs/common';
import { CountryScreenerService } from './country-screener.service';
import { CountryScreenerController } from './country-screener.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CountryScreenerController],
  providers: [CountryScreenerService],
  exports: [CountryScreenerService]
})
export class CountryScreenerModule {}
