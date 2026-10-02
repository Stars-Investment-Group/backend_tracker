import { Test, TestingModule } from '@nestjs/testing';
import { GlobalKpiController } from './global-kpi.controller';
import { GlobalKpiService } from './global-kpi.service';

describe('GlobalKpiController', () => {
  let controller: GlobalKpiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalKpiController],
      providers: [GlobalKpiService],
    }).compile();

    controller = module.get<GlobalKpiController>(GlobalKpiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
