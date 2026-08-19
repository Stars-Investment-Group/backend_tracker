import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';

@Injectable()
export class InstrumentService {

  constructor(private readonly databaseService: DatabaseService) {}


  create(createInstrumentDto: CreateInstrumentDto) {
    return this.databaseService.instrument.create({
      data: {
        ticker: createInstrumentDto.ticker,
        name: createInstrumentDto.name,
        assetClass: createInstrumentDto.assetClass,
        sector: createInstrumentDto.sector,
        industry: createInstrumentDto.industry,
        exchange: createInstrumentDto.exchange,
        country: createInstrumentDto.country,
        currency: createInstrumentDto.currency ?? 'USD',
        isin: createInstrumentDto.isin,
        cusip: createInstrumentDto.cusip,
        sedol: createInstrumentDto.sedol,
        metadata: createInstrumentDto.metadata ?? {},
      },
    });
  }

  findAll() {
    return this.databaseService.instrument.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  findOne(id: string) {
    return this.databaseService.instrument.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: string, updateInstrumentDto: UpdateInstrumentDto) {
    return `This action updates a #${id} instrument`;
  }

  remove(id: string) {
    return `This action removes a #${id} instrument`;
  }
}
