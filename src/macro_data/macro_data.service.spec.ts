import { Test, TestingModule } from '@nestjs/testing';
import { MacroDataService } from './macro_data.service';

describe('MacroDataService', () => {
  let service: MacroDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MacroDataService],
    }).compile();

    service = module.get<MacroDataService>(MacroDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
