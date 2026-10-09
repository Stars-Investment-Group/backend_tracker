import { Test, TestingModule } from '@nestjs/testing';
import { DataExplorerService } from './data-explorer.service';

describe('DataExplorerService', () => {
  let service: DataExplorerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataExplorerService],
    }).compile();

    service = module.get<DataExplorerService>(DataExplorerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
