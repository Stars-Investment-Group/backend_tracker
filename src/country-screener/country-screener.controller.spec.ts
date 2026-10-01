import { Test, TestingModule } from '@nestjs/testing';
import { CountryScreenerController } from './country-screener.controller';
import { CountryScreenerService } from './country-screener.service';

describe('CountryScreenerController', () => {
  let controller: CountryScreenerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryScreenerController],
      providers: [CountryScreenerService],
    }).compile();

    controller = module.get<CountryScreenerController>(CountryScreenerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
