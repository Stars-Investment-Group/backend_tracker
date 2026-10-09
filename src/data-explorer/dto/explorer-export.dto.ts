import { IsIn, IsOptional } from 'class-validator';

export class ExplorerExportDto {
  @IsOptional()
  @IsIn(['csv', 'json', 'excel'])
  format?: 'csv' | 'json' | 'excel' = 'csv';
}