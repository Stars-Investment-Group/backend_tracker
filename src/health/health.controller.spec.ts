import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DatabaseService } from '../database/database.service';

describe('HealthController', () => {
  let controller: HealthController;

  const mockDatabaseService = {
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health status with db connected', async () => {
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.services.database.status).toBe('healthy');
  });
});
