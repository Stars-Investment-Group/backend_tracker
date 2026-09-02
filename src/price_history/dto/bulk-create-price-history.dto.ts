import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { CreatePriceHistoryDto } from './create-price-history.dto';

export class BulkCreatePriceHistoryDto {
  @ApiProperty({
    description: 'Liste de cotations OHLCV à insérer en lot',
    type: [CreatePriceHistoryDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePriceHistoryDto)
  prices: CreatePriceHistoryDto[];
}
