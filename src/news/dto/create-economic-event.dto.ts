import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventImpact } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEconomicEventDto {
  @ApiProperty({
    description: "Titre de l'événement économique",
    example: 'Décision sur les taux directeurs de la BCEAO',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: "Code pays ISO 3 lettres (ex: SEN, CIV, USA, EMU)",
    example: 'CIV',
    maxLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  country: string;

  @ApiProperty({
    description: "Date et heure de publication de l'indicateur / événement",
    example: '2026-09-10T10:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  eventDate: Date;

  @ApiPropertyOptional({
    description: "Niveau d'impact attendu sur les marchés",
    enum: EventImpact,
    default: EventImpact.medium,
    example: EventImpact.high,
  })
  @IsOptional()
  @IsEnum(EventImpact)
  impact?: EventImpact;

  @ApiPropertyOptional({
    description: "Valeur réelle publiée (si disponible)",
    example: '3.50%',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  actual?: string;

  @ApiPropertyOptional({
    description: 'Valeur prévue / consensus des analystes',
    example: '3.50%',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  forecast?: string;

  @ApiPropertyOptional({
    description: 'Valeur de la période précédente',
    example: '3.25%',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  previous?: string;

  @ApiPropertyOptional({
    description: "Unité de mesure de l'indicateur",
    example: '%',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;
}
