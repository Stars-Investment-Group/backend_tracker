import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateCountryScreenerDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  incomeLevel?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minGrowth?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxInflation?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsString()
  @IsIn([
    'overallScore',
    'growth',
    'inflation',
    'countryName',
  ])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
