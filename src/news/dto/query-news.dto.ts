import { ApiPropertyOptional } from '@nestjs/swagger';
import { AssetClass, NewsSentiment } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class QueryNewsDto {
  @ApiPropertyOptional({
    description: 'Terme de recherche textuel (titre, contenu, résumé)',
    example: 'BRVM',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: "Recherche par ticker d'instrument lié (ex: SNTS, ECOB)",
    example: 'SNTS',
  })
  @IsOptional()
  @IsString()
  ticker?: string;

  @ApiPropertyOptional({
    description: "Filtrage par ID d'instrument spécifique",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  instrumentId?: string;

  @ApiPropertyOptional({
    description: "Filtrage par classe d'actifs",
    enum: AssetClass,
    example: AssetClass.equity,
  })
  @IsOptional()
  @IsEnum(AssetClass)
  assetClass?: AssetClass;

  @ApiPropertyOptional({
    description: 'Filtrage par sentiment de marché',
    enum: NewsSentiment,
    example: NewsSentiment.positive,
  })
  @IsOptional()
  @IsEnum(NewsSentiment)
  sentiment?: NewsSentiment;

  @ApiPropertyOptional({
    description: 'Filtrage exclusif des actualités urgentes / flash',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isBreaking?: boolean;

  @ApiPropertyOptional({
    description: "Nombre maximum d'articles à retourner",
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Nombre de résultats à ignorer pour la pagination',
    default: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
