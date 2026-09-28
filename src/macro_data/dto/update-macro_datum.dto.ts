import { PartialType } from '@nestjs/swagger';
import { CreateMacroDatumDto } from './create-macro_datum.dto';

export class UpdateMacroDatumDto extends PartialType(CreateMacroDatumDto) {}
