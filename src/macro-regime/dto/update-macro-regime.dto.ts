import { PartialType } from '@nestjs/swagger';
import { CreateMacroRegimeDto } from './create-macro-regime.dto';

export class UpdateMacroRegimeDto extends PartialType(CreateMacroRegimeDto) {}
