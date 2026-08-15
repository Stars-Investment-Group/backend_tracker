import { Test, TestingModule } from '@nestjs/testing';
import { UemoaService } from './uemoa.service';

describe('UemoaService', () => {
  let service: UemoaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UemoaService],
    }).compile();

    service = module.get<UemoaService>(UemoaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
