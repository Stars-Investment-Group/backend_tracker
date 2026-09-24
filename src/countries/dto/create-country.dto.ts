import { IsOptional, IsString } from "class-validator";

export class CreateCountryDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  income?: string;
}
