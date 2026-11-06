import { PartialType } from '@nestjs/swagger';
import { CreateAlertMacroDto } from './create-alert-macro.dto';

export class UpdateAlertMacroDto extends PartialType(CreateAlertMacroDto) {}
