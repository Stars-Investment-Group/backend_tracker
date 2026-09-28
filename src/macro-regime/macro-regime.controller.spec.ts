import { Test, TestingModule } from '@nestjs/testing';
import { MacroRegimeController } from './macro-regime.controller';
import { MacroRegimeService } from './macro-regime.service';

describe('MacroRegimeController', () => {
  let controller: MacroRegimeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MacroRegimeController],
      providers: [MacroRegimeService],
    }).compile();

    controller = module.get<MacroRegimeController>(MacroRegimeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
