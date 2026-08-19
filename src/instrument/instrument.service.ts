import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';

@Injectable()
export class InstrumentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createInstrumentDto: CreateInstrumentDto) {
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

  async findAll() {
    return this.databaseService.instrument.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const instrument = await this.databaseService.instrument.findUnique({
      where: { id },
      include: {
        transactions: true,
      },
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument avec l'ID ${id} non trouvé.`);
    }

    return instrument;
  }

  async update(id: string, updateInstrumentDto: UpdateInstrumentDto) {
    await this.findOne(id);

    return this.databaseService.instrument.update({
      where: { id },
      data: {
        ticker: updateInstrumentDto.ticker,
        name: updateInstrumentDto.name,
        assetClass: updateInstrumentDto.assetClass,
        sector: updateInstrumentDto.sector,
        industry: updateInstrumentDto.industry,
        exchange: updateInstrumentDto.exchange,
        country: updateInstrumentDto.country,
        currency: updateInstrumentDto.currency,
        isin: updateInstrumentDto.isin,
        cusip: updateInstrumentDto.cusip,
        sedol: updateInstrumentDto.sedol,
        metadata: updateInstrumentDto.metadata,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Vérifier si des transactions sont liées
    const transactionCount = await this.databaseService.transaction.count({
      where: { instrumentId: id },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer cet instrument car ${transactionCount} transaction(s) y sont associées.`,
      );
    }

    return this.databaseService.instrument.delete({
      where: { id },
    });
  }
}
