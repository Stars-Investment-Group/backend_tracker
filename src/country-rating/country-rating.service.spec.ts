import { Test, TestingModule } from '@nestjs/testing';
import { CountryRatingService } from './country-rating.service';

describe('CountryRatingService', () => {
  let service: CountryRatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountryRatingService],
    }).compile();

    service = module.get<CountryRatingService>(CountryRatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
