import { PartialType } from '@nestjs/swagger';
import { CreateDataExplorerDto } from './create-data-explorer.dto';

export class UpdateDataExplorerDto extends PartialType(CreateDataExplorerDto) {}
