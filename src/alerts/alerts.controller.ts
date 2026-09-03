import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { CurrentUser } from '../sig/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Alert')
@ApiBearerAuth('access-token')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @Post()
  @ApiOperation({
    summary: 'Créer un Alert',
    description: 'Ajoute un nouveau Alert',
  })
  @ApiResponse({ status: 201, description: 'Alert ajoutée avec succès' })
  @ApiResponse({ status: 400, description: 'Données Invalides ou solde insuffisant' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Instrument introuvable' })
  create(@Body() createAlertDto: CreateAlertDto, @CurrentUser('id') userId: any,) {
    return this.alertsService.create(createAlertDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les Alerts',
    description: "Retourne les Alerts de l'utilisateur",
  })
  @ApiResponse({ status: 200, description: 'Liste de Alerts retournée avec succès' })
  findAll(@CurrentUser('id') userId: any) {
    return this.alertsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un Alert par ID',
    description: 'Retourne un Alert spécifique',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de Alert" })
  @ApiResponse({ status: 200, description: 'Alert retournée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Alert introuvable' })
  findOne(@CurrentUser('id') userId: any,@Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.findOne(userId,id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour un Alert',
    description: "Modifie les informations d'un Alert existante",
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de Alert" })
  @ApiResponse({ status: 200, description: 'Alert mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Alert non trouvée' })
  update(@CurrentUser('id') userId: any, @Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertsService.update(userId,id, updateAlertDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un Alert',
    description: 'Supprime définitivement une Alert',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de Alert" })
  @ApiResponse({ status: 200, description: 'Alert supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Alert non trouvée' })
  remove(@CurrentUser('id') userId: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.alertsService.remove(userId,id);
  }
}
