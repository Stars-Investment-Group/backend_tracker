import { Test, TestingModule } from '@nestjs/testing';
import { AlertMacroService } from './alert-macro.service';

describe('AlertMacroService', () => {
  let service: AlertMacroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertMacroService],
    }).compile();

    service = module.get<AlertMacroService>(AlertMacroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
