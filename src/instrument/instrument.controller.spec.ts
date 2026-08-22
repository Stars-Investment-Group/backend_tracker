import { Test, TestingModule } from '@nestjs/testing';
import { InstrumentController } from './instrument.controller';
import { InstrumentService } from './instrument.service';

describe('InstrumentController', () => {
  let controller: InstrumentController;
  let service: InstrumentService;

  const mockInstrumentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstrumentController],
      providers: [
        {
          provide: InstrumentService,
          useValue: mockInstrumentService,
        },
      ],
    }).compile();

    controller = module.get<InstrumentController>(InstrumentController);
    service = module.get<InstrumentService>(InstrumentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
