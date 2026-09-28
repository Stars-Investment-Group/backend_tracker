import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MacroDataService } from './macro_data.service';
import { CreateMacroDatumDto, MacroDataQueryDto } from './dto/create-macro_datum.dto';
import { UpdateMacroDatumDto } from './dto/update-macro_datum.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Internal Macro Data')
@ApiBearerAuth('access-token')
@Controller('internal/macro/data')
export class MacroDataInternalController {
  constructor(private readonly macroDataService: MacroDataService) {}


  @Post()
  @ApiOperation({
    summary: 'Ingestion de données macro data',
    description: 'Ajoute une nouvelle ingestion de données macro data',
  })
  @ApiResponse({ status: 201, description: 'Données ajoutés avec succès' })
  @ApiResponse({ status: 400, description: 'Données Invalides' })
  create(@Body() dto: CreateMacroDatumDto) {
    return this.macroDataService.create(dto);
  }
}
