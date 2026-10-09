import { Test, TestingModule } from '@nestjs/testing';
import { DataExplorerController } from './data-explorer.controller';
import { DataExplorerService } from './data-explorer.service';

describe('DataExplorerController', () => {
  let controller: DataExplorerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataExplorerController],
      providers: [DataExplorerService],
    }).compile();

    controller = module.get<DataExplorerController>(DataExplorerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
