import { IsOptional, IsString } from "class-validator";

export class CreatePortfolioDto {

    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    currency: string;
}
