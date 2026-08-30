import { IsOptional, IsString } from 'class-validator';

export class FindIndicatorsDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  dataset?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  seriesCode?: string;
}
