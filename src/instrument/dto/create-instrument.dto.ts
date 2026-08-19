import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
  } from 'class-validator';
  import { AssetClass } from "@prisma/client";
import { ApiProperty } from '@nestjs/swagger';

  
  export class CreateInstrumentDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    ticker?: string;
  
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;
  
    @ApiProperty({description: 'disponibilité du produit', enum: AssetClass})
    @IsEnum(AssetClass)
    assetClass: AssetClass;
  
    @IsOptional()
    @IsString()
    sector?: string;
  
    @IsOptional()
    @IsString()
    industry?: string;
  
    @IsOptional()
    @IsString()
    exchange?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(3)
    country?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(3)
    currency?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(12)
    isin?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(9)
    cusip?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(7)
    sedol?: string;
  
    @IsOptional()
    metadata?: Record<string, any>;
  }