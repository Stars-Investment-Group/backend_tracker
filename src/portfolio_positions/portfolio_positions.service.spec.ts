import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioPositionsService } from './portfolio_positions.service';

describe('PortfolioPositionsService', () => {
  let service: PortfolioPositionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioPositionsService],
    }).compile();

    service = module.get<PortfolioPositionsService>(PortfolioPositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
