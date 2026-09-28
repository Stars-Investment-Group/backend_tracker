import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MacroDataService } from './macro_data.service';
import { CreateMacroDatumDto, MacroDataQueryDto } from './dto/create-macro_datum.dto';
import { UpdateMacroDatumDto } from './dto/update-macro_datum.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';


@ApiTags('Macro Data')
@Controller('macro-data')
export class MacroDataController {
  constructor(private readonly macroDataService: MacroDataService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Lister les données',
    description:
      "Retourne les données (filtres: pays, indicateur, période)",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des données retournée avec succès',
  })
  findAll(@Query() query: MacroDataQueryDto) {
    return this.macroDataService.findAll(query);
  }


  @Public()
  @Get('latest')
  @ApiOperation({
    summary: 'Lister les dernières valeurs',
    description:
      "Retourne les données de dernières valeurs de tous les indicateurs",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des dernières valeurs de tous les indicateurs',
  })
  findLatest() {
    return this.macroDataService.findLatest();
  }


  @Public()
  @Get(':country/:indicator/vintages')
  @ApiOperation({
    summary: 'Lister Historique des vintages',
    description:
      "Retourne la liste Historique des vintages",
  })
  @ApiResponse({
    status: 200,
    description: 'Historique des vintages',
  })
  findVintages(
    @Param('country') country: string,
    @Param('indicator') indicator: string,
  ) {
    return this.macroDataService.findVintages(
      country,
      indicator,
    );
  }


  @Public()
  @Get(':country/:indicator')
  @ApiOperation({
    summary: 'Lister Série complète',
    description:
      "Retourne la liste Série complète",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste Série complète',
  })
  findSeries(
    @Param('country') country: string,
    @Param('indicator') indicator: string,
  ) {
    return this.macroDataService.findSeries(
      country,
      indicator,
    );
  }

}
