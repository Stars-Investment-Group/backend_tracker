import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetClass, NewsSentiment } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateNewsArticleDto {
  @ApiProperty({
    description: "Titre de l'article d'actualité",
    example: 'La BRVM clôture en hausse portée par le secteur bancaire',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: "Contenu complet de l'article",
    example: 'Les indices boursiers de la BRVM ont enregistré une hausse notable ce vendredi...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: "Résumé concis de l'article généré ou rédigé",
    example: 'Hausse générale des valeurs bancaires à la BRVM en fin de semaine.',
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({
    description: "Sentiment de marché véhiculé par l'actualité",
    enum: NewsSentiment,
    example: NewsSentiment.positive,
  })
  @IsOptional()
  @IsEnum(NewsSentiment)
  sentiment?: NewsSentiment;

  @ApiPropertyOptional({
    description: "Source médiatique ou agence d'information",
    example: 'Financial Afrik',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string;

  @ApiPropertyOptional({
    description: "Lien URL source vers l'article d'origine",
    example: 'https://financialafrik.com/2026/09/05/brvm-hausse',
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional({
    description: "Classe d'actif concernée par l'actualité",
    enum: AssetClass,
    example: AssetClass.equity,
  })
  @IsOptional()
  @IsEnum(AssetClass)
  assetClass?: AssetClass;

  @ApiPropertyOptional({
    description: "Indique s'il s'agit d'une actualité urgente / flash (Breaking News)",
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isBreaking?: boolean;

  @ApiPropertyOptional({
    description: "Liste des IDs d'instruments financiers rattachés à cette actualité",
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  instrumentIds?: string[];
}
