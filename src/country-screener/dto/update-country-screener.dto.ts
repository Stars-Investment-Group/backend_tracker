import { PartialType } from '@nestjs/swagger';
import { CreateCountryScreenerDto } from './create-country-screener.dto';

export class UpdateCountryScreenerDto extends PartialType(CreateCountryScreenerDto) {}
