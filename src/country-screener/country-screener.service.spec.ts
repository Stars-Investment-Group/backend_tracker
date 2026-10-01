import { Test, TestingModule } from '@nestjs/testing';
import { CountryScreenerService } from './country-screener.service';

describe('CountryScreenerService', () => {
  let service: CountryScreenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CountryScreenerService],
    }).compile();

    service = module.get<CountryScreenerService>(CountryScreenerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
