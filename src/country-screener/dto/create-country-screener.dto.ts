
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCountryScreenerDto {
  @ApiPropertyOptional({
    description: 'Filtrer par région',
    example: 'UEMOA',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par niveau de revenu',
    example: 'Lower-Middle',
  })
  @IsOptional()
  @IsString()
  incomeLevel?: string;

  @ApiPropertyOptional({
    description: 'Croissance minimale du PIB (%)',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minGrowth?: number;

  @ApiPropertyOptional({
    description: 'Inflation maximale (%)',
    example: 3,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxInflation?: number;

  @ApiPropertyOptional({
    description: 'Note minimale du pays',
    example: 50,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Critère de tri',
    enum: ['overallScore', 'growth', 'inflation', 'countryName'],
    example: 'overallScore',
  })
  @IsOptional()
  @IsString()
  @IsIn(['overallScore', 'growth', 'inflation', 'countryName'])
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    default: 1,
    minimum: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Nombre de résultats par page (maximum 100)',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}