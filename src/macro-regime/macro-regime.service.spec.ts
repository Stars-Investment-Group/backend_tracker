import { Test, TestingModule } from '@nestjs/testing';
import { MacroRegimeService } from './macro-regime.service';

describe('MacroRegimeService', () => {
  let service: MacroRegimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MacroRegimeService],
    }).compile();

    service = module.get<MacroRegimeService>(MacroRegimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
