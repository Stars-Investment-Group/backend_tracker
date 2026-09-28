import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MacroRegimeService } from './macro-regime.service';
import { CreateMacroRegimeDto } from './dto/create-macro-regime.dto';
import { UpdateMacroRegimeDto } from './dto/update-macro-regime.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';


@ApiTags('Macro Regime')
@Controller('macro-regime')
export class MacroRegimeController {
  constructor(private readonly macroRegimeService: MacroRegimeService) {}


  @Public()
  @Get()
  @ApiOperation({
    summary: 'Regime actuel disponible',
    description:
      "Retourne la liste des régimes actuellement disponibles",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des données retournée avec succès',
  })
  findAll() {
    return this.macroRegimeService.findAll();
  }

  @Public()
  @Get('global')
  @ApiOperation({
    summary: 'Vue globale des régimes actuels',
    description:
      "Retourne la liste globale des régimes actuels",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des données retournée avec succès',
  })
  findGlobal() {
    return this.macroRegimeService.findGlobal();
  }


  @Public()
  @Get(':country')
  @ApiOperation({
    summary: 'Regime actuel pays',
    description:
      "Retourne la liste des régimes actuellement d'un pays",
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des données retournée avec succès',
  })
  findCurrentByCountry(
    @Param('country') country: string,
  ) {
    return this.macroRegimeService.findCurrentByCountry(
      country,
    );
  }

  @Post('calculate/:country')
  @ApiOperation({
    summary: 'Recalculer le régime',
    description: 'Ajoute un nouveau calcul de regime',
  })
  @ApiResponse({ status: 201, description: 'Données ajoutés avec succès' })
  @ApiResponse({ status: 400, description: 'Données Invalides' })
  calculate(
    @Param('country') country: string,
  ) {
    return this.macroRegimeService.calculate(country);
  }
}
