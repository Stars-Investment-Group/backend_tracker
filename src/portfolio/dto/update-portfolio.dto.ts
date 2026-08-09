import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePortfolioDto } from './create-portfolio.dto';

export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
