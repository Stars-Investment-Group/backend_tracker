import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateMacroDatumDto {
        @IsString()
        @Length(3, 3)
        countryCode: string;
      
        @IsUUID()
        indicatorId: string;
      
        @IsDateString()
        vintageDate: string;
      
        @IsDateString()
        period: string;
      
        @IsNumber()
        value: number;
      
        @IsOptional()
        @IsBoolean()
        isForecast?: boolean;
      
        @IsOptional()
        @IsBoolean()
        isEstimate?: boolean;
      
        @IsOptional()
        @IsDateString()
        releaseDate?: string;
      
        @IsOptional()
        @IsDateString()
        nextReleaseDate?: string;
      
        @IsOptional()
        @IsString()
        source?: string;
}

export class MacroDataQueryDto {
    @IsOptional()
    @IsString()
    country?: string;
  
    @IsOptional()
    @IsString()
    indicator?: string;
  
    @IsOptional()
    @IsDateString()
    from?: string;
  
    @IsOptional()
    @IsDateString()
    to?: string;
  }
