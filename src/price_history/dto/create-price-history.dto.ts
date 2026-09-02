import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePriceHistoryDto {
  @ApiProperty({ description: "UUID de l'instrument financier", example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  instrumentId: string;

  @ApiProperty({ description: "Horodatage de la cotation (ISO-8601)", example: '2026-09-01T16:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  timestamp: string;

  @ApiPropertyOptional({ description: "Prix d'ouverture (Open)", example: 185.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  open?: number;

  @ApiPropertyOptional({ description: 'Prix le plus haut (High)', example: 188.20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  high?: number;

  @ApiPropertyOptional({ description: 'Prix le plus bas (Low)', example: 184.90 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  low?: number;

  @ApiProperty({ description: 'Prix de clôture (Close)', example: 187.75 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  close: number;

  @ApiPropertyOptional({ description: 'Volume échangé', example: 45200000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'Prix ajusté (dividendes/splits)', default: false, example: false })
  @IsOptional()
  @IsBoolean()
  isAdjusted?: boolean;
}
