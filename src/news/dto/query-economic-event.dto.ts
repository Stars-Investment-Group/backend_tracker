import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventImpact } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class QueryEconomicEventDto {
  @ApiPropertyOptional({
    description: 'Code pays ISO (ex: SEN, CIV, USA, EMU)',
    example: 'SEN',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: "Niveau d'impact attendu",
    enum: EventImpact,
    example: EventImpact.high,
  })
  @IsOptional()
  @IsEnum(EventImpact)
  impact?: EventImpact;

  @ApiPropertyOptional({
    description: 'Filtre de période rapide',
    enum: ['today', 'this_week', 'this_month', 'all'],
    example: 'this_week',
  })
  @IsOptional()
  @IsString()
  period?: 'today' | 'this_week' | 'this_month' | 'all';

  @ApiPropertyOptional({
    description: 'Date de début de l’intervalle de recherche (ISO 8601)',
    example: '2026-09-01T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Date de fin de l’intervalle de recherche (ISO 8601)',
    example: '2026-09-30T23:59:59.999Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({
    description: "Nombre maximum d'événements à retourner",
    default: 50,
    minimum: 1,
    maximum: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

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
