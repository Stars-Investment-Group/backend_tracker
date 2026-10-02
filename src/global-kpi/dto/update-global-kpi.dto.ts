import { PartialType } from '@nestjs/swagger';
import { CreateGlobalKpiDto } from './create-global-kpi.dto';

export class UpdateGlobalKpiDto extends PartialType(CreateGlobalKpiDto) {}
