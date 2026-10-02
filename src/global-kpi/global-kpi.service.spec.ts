import { Test, TestingModule } from '@nestjs/testing';
import { GlobalKpiService } from './global-kpi.service';

describe('GlobalKpiService', () => {
  let service: GlobalKpiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalKpiService],
    }).compile();

    service = module.get<GlobalKpiService>(GlobalKpiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
