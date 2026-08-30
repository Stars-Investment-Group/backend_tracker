import { PartialType } from '@nestjs/swagger';
import { CreatePortfolioPositionDto } from './create-portfolio_position.dto';

export class UpdatePortfolioPositionDto extends PartialType(CreatePortfolioPositionDto) {}
