import { Test, TestingModule } from '@nestjs/testing';
import { MacroDataController } from './macro_data.controller';
import { MacroDataService } from './macro_data.service';

describe('MacroDataController', () => {
  let controller: MacroDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MacroDataController],
      providers: [MacroDataService],
    }).compile();

    controller = module.get<MacroDataController>(MacroDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
