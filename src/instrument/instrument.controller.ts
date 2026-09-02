import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InstrumentService } from './instrument.service';
import { CreateInstrumentDto } from './dto/create-instrument.dto';
import { UpdateInstrumentDto } from './dto/update-instrument.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../sig/decorators/roles.decorator';
import { RoleUser } from '@prisma/client';

@ApiTags('Instrument')
@ApiBearerAuth('access-token')
@Controller('instrument')
export class InstrumentController {
  constructor(private readonly instrumentService: InstrumentService) {}

  @Post()
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({
    summary: 'Créer un instrument',
    description: 'Ajoute un nouvel instrument financier (Admin/Analyste)',
  })
  @ApiResponse({ status: 201, description: 'Instrument ajouté avec succès' })
  @ApiResponse({ status: 400, description: 'Données Invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  create(@Body() createInstrumentDto: CreateInstrumentDto) {
    return this.instrumentService.create(createInstrumentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister tous les instruments',
    description: 'Retourne tous les instruments enregistrés',
  })
  @ApiResponse({ status: 200, description: 'Liste des instruments retournée avec succès' })
  findAll() {
    return this.instrumentService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un instrument par ID', 
    description: 'Retourne un instrument spécifique'
  })
  @ApiParam({ name: 'id', required: true, description: "L'UUID de l'instrument" })
  @ApiResponse({ status: 200, description: 'Instrument retourné avec succès' })
  @ApiResponse({ status: 404, description: 'Instrument non trouvé' })
  findOne(@Param('id') id: string) {
    return this.instrumentService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({
    summary: 'Mettre à jour un instrument',
    description: "Modifie les informations d'un instrument existant (Admin/Analyste).",
  })
  @ApiParam({ name: 'id', required: true, description: "L'UUID de l'instrument" })
  @ApiResponse({ status: 200, description: 'Instrument mis à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Instrument non trouvé.' })
  update(@Param('id') id: string, @Body() updateInstrumentDto: UpdateInstrumentDto) {
    return this.instrumentService.update(id, updateInstrumentDto);
  }

  @Delete(':id')
  @Roles(RoleUser.ADMIN)
  @ApiOperation({
    summary: 'Supprimer un instrument',
    description: 'Supprime un instrument (Admin uniquement).',
  })
  @ApiParam({ name: 'id', required: true, description: "L'UUID de l'instrument" })
  @ApiResponse({ status: 200, description: 'Instrument supprimé avec succès.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Instrument non trouvé.' })
  remove(@Param('id') id: string) {
    return this.instrumentService.remove(id);
  }
}
