import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum PriceSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryPriceHistoryDto {
  @ApiPropertyOptional({ description: 'Date de début (ISO-8601)', example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Date de fin (ISO-8601)', example: '2026-09-01T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Ordre de tri chronologique', enum: PriceSortOrder, default: PriceSortOrder.DESC })
  @IsOptional()
  @IsEnum(PriceSortOrder)
  order?: PriceSortOrder = PriceSortOrder.DESC;

  @ApiPropertyOptional({ description: 'Nombre maximum de résultats', default: 100, example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Offset de pagination', default: 0, example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
