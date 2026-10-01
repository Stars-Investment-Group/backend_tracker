import { Test, TestingModule } from '@nestjs/testing';
import { CountryRatingController } from './country-rating.controller';
import { CountryRatingService } from './country-rating.service';

describe('CountryRatingController', () => {
  let controller: CountryRatingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryRatingController],
      providers: [CountryRatingService],
    }).compile();

    controller = module.get<CountryRatingController>(CountryRatingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
