import { PartialType } from '@nestjs/swagger';
import { CreateCountryRatingDto } from './create-country-rating.dto';

export class UpdateCountryRatingDto extends PartialType(CreateCountryRatingDto) {}
