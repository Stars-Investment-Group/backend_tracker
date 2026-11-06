import { Test, TestingModule } from '@nestjs/testing';
import { AlertMacroController } from './alert-macro.controller';
import { AlertMacroService } from './alert-macro.service';

describe('AlertMacroController', () => {
  let controller: AlertMacroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertMacroController],
      providers: [AlertMacroService],
    }).compile();

    controller = module.get<AlertMacroController>(AlertMacroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
