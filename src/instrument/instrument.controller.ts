import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstrumentService } from './instrument.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Instrument')
@ApiBearerAuth('access-token')
@Controller('instrument')
export class InstrumentController {
  constructor(private readonly instrumentService: InstrumentService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un instrument',
    description: 'Ajoute un nouveau instrument',
  })
  @ApiResponse({status: 201, description: 'instrument ajouté avec succès' })
  @ApiResponse({status: 400, description: 'Données Invalide' })
  create(@Body() createInstrumentDto: CreateInstrumentDto) {
    return this.instrumentService.create(createInstrumentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister tous les instruments',
    description: 'Retourne tous les instruments enregistrés',
  })
  @ApiResponse({status: 201, description: 'liste tous les instruments avec succès'})
  findAll() {
    return this.instrumentService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir des instruments par filtre', 
    description: 'retourne un ou des instruments par filtre'
  })
  @ApiResponse({status: 200, description: 'instrument retourne avec succes'})
  @ApiResponse({status: 404, description: 'filtre impossible'})
  findOne(@Param('id') id: string) {
    return this.instrumentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un instrument',
    description: "Modifie les informations d'un instrument existant.",
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du instrument" })
  @ApiResponse({ status: 200, description: 'instrument mis à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 404, description: 'instrument non trouvé.' })
  update(@Param('id') id: string, @Body() updateInstrumentDto: UpdateInstrumentDto) {
    return this.instrumentService.update(id, updateInstrumentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un instrument',
    description: 'Supprime un instrument.',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID du instrument" })
  @ApiResponse({ status: 200, description: 'instrument supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'instrument non trouvé.' })
  remove(@Param('id') id: string) {
    return this.instrumentService.remove(id);
  }
}
