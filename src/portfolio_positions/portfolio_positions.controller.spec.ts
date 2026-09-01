import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioPositionsController } from './portfolio_positions.controller';
import { PortfolioPositionsService } from './portfolio_positions.service';

describe('PortfolioPositionsController', () => {
  let controller: PortfolioPositionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioPositionsController],
      providers: [PortfolioPositionsService],
    }).compile();

    controller = module.get<PortfolioPositionsController>(PortfolioPositionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
