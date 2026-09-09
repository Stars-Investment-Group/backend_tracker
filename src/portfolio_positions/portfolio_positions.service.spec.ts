import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioPositionsService } from './portfolio_positions.service';
import { DatabaseService } from '../database/database.service';

describe('PortfolioPositionsService', () => {
  let service: PortfolioPositionsService;

  const mockDatabaseService = {
    $queryRaw: jest.fn(),
    portfolio: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioPositionsService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<PortfolioPositionsService>(PortfolioPositionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
