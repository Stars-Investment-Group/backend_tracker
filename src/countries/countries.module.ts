import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService]
})
export class CountriesModule {}
