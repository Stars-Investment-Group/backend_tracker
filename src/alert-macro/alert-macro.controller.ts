import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/sig/decorators/current-user.decorator';
import { AlertMacroService } from './alert-macro.service';
import { CreateAlertMacroDto } from './dto/create-alert-macro.dto';
import { UpdateAlertMacroDto } from './dto/update-alert-macro.dto';
import { CreateAlertSubscriptionDto } from './dto/create-alert-subscription.dto';



@ApiTags('Alert Macro')
@ApiBearerAuth('access-token')
@Controller('alert-macro')
export class AlertMacroController {
  constructor(private readonly alertMacroService: AlertMacroService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les alertes de l’utilisateur connecté' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({
    name: 'isRead',
    required: false,
    enum: ['true', 'false'],
    description: 'Filtrer les alertes lues ou non lues',
  })
  findAll(
    @CurrentUser() user: any,
    @Query('category') category?: string,
    @Query('severity') severity?: string,
    @Query('isRead') isRead?: string,
  ) {
    return this.alertMacroService.findAll(user.id, {
      category,
      severity,
      isRead,
    });
  }

  @Get('summary')
  @ApiOperation({ summary: 'Statistiques des alertes par sévérité' })
  getSummary(@CurrentUser() user: any) {
    return this.alertMacroService.getSummary(user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Lister les alertes non lues' })
  findUnread(@CurrentUser() user: any) {
    return this.alertMacroService.findUnread(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marquer toutes les alertes comme lues' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.alertMacroService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marquer une alerte comme lue' })
  markAsRead(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.alertMacroService.markAsRead(user.id, id);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'Lister les abonnements aux alertes' })
  findSubscriptions(@CurrentUser() user: any) {
    return this.alertMacroService.findSubscriptions(user.id);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Créer un abonnement aux alertes' })
  createSubscription(
    @CurrentUser() user: any,
    @Body() dto: CreateAlertSubscriptionDto,
  ) {
    return this.alertMacroService.createSubscription(user.id, dto);
  }

  @Delete('subscriptions/:id')
  @ApiOperation({ summary: 'Supprimer un abonnement aux alertes' })
  deleteSubscription(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.alertMacroService.deleteSubscription(user.id, id);
  }
}
