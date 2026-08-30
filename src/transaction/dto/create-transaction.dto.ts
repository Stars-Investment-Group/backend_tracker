import {
    IsDateString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
  } from 'class-validator';
  
  import { TransactionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
  
  export class CreateTransactionDto {
    @IsUUID()
    portfolioId: string;
  
    @IsUUID()
    instrumentId: string;

    @ApiProperty({description: 'Type de Transactions', enum: TransactionType})
    @IsEnum(TransactionType, {
        message: ({ value }) =>
        `Le type '${value}' est invalide. Valeurs autorisées: ${Object.values(TransactionType).join(', ')}`,
    })
    transactionType: TransactionType;
  
    @IsNumber()
    @Min(0)
    quantity: number;
  
    @IsNumber()
    @Min(0)
    price: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    fees?: number;
  
    @IsDateString()
    transactionDate: string;
  
    @IsOptional()
    @IsString()
    notes?: string;
  }