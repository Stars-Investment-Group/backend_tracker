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
  
  export class CreateTransactionDto {
    @IsUUID()
    portfolioId: string;
  
    @IsUUID()
    instrumentId: string;
  
    @IsEnum(TransactionType)
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