
import {
    IsIn,
    IsOptional,
    IsString,
    Length,
  } from 'class-validator';
  
  export class CreateAlertSubscriptionDto {
    @IsOptional()
    @IsString()
    @IsIn(['Régime', 'Rating', 'Marché', 'Policy', 'Data'])
    category?: string | null;
  
    @IsOptional()
    @IsString()
    @Length(3, 3)
    countryCode?: string | null;
  
    @IsOptional()
    @IsString()
    @IsIn(['critique', 'avertissement', 'information', 'positif'])
    minSeverity?: string | null;
  }
  