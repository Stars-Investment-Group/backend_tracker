import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { WatchlistsService } from './watchlists.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';
import { CurrentUser } from 'src/sig/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('watchlists')
@ApiBearerAuth('access-token')
@Controller('watchlists')
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une liste de surveillance',
    description: 'Ajoute une liste de surveillancen dans un instrument',
  })
  @ApiResponse({ status: 201, description: 'liste surveillance ajoutée avec succès' })
  @ApiResponse({ status: 400, description: 'Données Invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Liste introuvable' })
  create(@Body() createWatchlistDto: CreateWatchlistDto, @CurrentUser('id') userId: any) {
    return this.watchlistsService.create(createWatchlistDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les listes de surveillances',
    description: "Retourne les listes de surveillances de l'utilisateur",
  })
  @ApiResponse({ status: 200, description: 'Liste de surveillance retournée avec succès' })
  findAll(@CurrentUser('id') userId: any) {
    return this.watchlistsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une liste de surveillance par ID',
    description: 'Retourne une liste spécifique',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la liste" })
  @ApiResponse({ status: 200, description: 'Liste de surveillance retournée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Liste introuvable' })
  findOne(@CurrentUser('id') userId: any,@Param('id', ParseUUIDPipe) id: string) {
    return this.watchlistsService.findOne(userId,id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mettre à jour une liste de surveillance',
    description: "Modifie les informations d'une liste existante",
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la liste" })
  @ApiResponse({ status: 200, description: 'Liste mise à jour avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Liste non trouvée' })
  update(@CurrentUser('id') userId: any, @Param('id', ParseUUIDPipe) id: string, @Body() updateWatchlistDto: UpdateWatchlistDto) {
    return this.watchlistsService.update(userId,id, updateWatchlistDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une Liste de surveillance',
    description: 'Supprime définitivement une Liste',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la Liste" })
  @ApiResponse({ status: 200, description: 'Liste supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Liste non trouvée' })
  remove(@CurrentUser('id') userId: any, @Param('id',ParseUUIDPipe) id: string) {
    return this.watchlistsService.remove(userId,id);
  }

  @Post(':id/instruments/:instrumentId')
  @Post()
  @ApiOperation({
    summary: 'Créer un instrument de liste',
    description: 'Ajoute une nouvelle instrument de liste',
  })
  @ApiResponse({ status: 201, description: 'Instrument de Liste ajoutée avec succès' })
  @ApiResponse({ status: 400, description: 'Données Invalides ou solde insuffisant' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Instrument introuvable' })
  addInstrument(
    @CurrentUser('id') userId: any,

    @Param('id', ParseUUIDPipe)
    watchlistId: string,

    @Param('instrumentId', ParseUUIDPipe)
    instrumentId: string,
  ) {
    return this.watchlistsService.addInstrument(
      userId,
      watchlistId,
      instrumentId,
    );
  }

  @Get(':id/instruments')
  @ApiOperation({
    summary: 'Lister les listes par id instruments',
    description: "Retourne les listes instruments de l'utilisateur",
  })
  @ApiResponse({ status: 200, description: 'Liste instruments retournée avec succès' })
  getInstruments(
    @CurrentUser('id') userId: any,

    @Param('id', ParseUUIDPipe)
    watchlistId: string,
  ) {
    return this.watchlistsService.getInstruments(
      userId,
      watchlistId,
    );
  }

  @Delete(':id/instruments/:instrumentId')
  @ApiOperation({
    summary: 'Supprimer une Liste instrument',
    description: 'Supprime définitivement une Liste instrument',
  })
  @ApiParam({ name: 'id', required: true, description: "L'ID de la Liste" })
  @ApiResponse({ status: 200, description: 'Liste supprimée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiResponse({ status: 404, description: 'Liste Instrument non trouvée' })
  removeInstrument(
    @CurrentUser() userId: any,

    @Param('id', ParseUUIDPipe)
    watchlistId: string,

    @Param('instrumentId', ParseUUIDPipe)
    instrumentId: string,
  ) {
    return this.watchlistsService.removeInstrument(
      userId,
      watchlistId,
      instrumentId,
    );
  }
}
