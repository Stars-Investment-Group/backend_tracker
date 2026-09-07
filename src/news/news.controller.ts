import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssetClass, EventImpact, RoleUser } from '@prisma/client';
import { CurrentUser } from '../sig/decorators/current-user.decorator';
import { Roles } from '../sig/decorators/roles.decorator';
import { NewsService } from './news.service';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { CreateEconomicEventDto } from './dto/create-economic-event.dto';
import { QueryEconomicEventDto } from './dto/query-economic-event.dto';

@ApiTags('News')
@ApiBearerAuth('access-token')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('breaking')
  @ApiOperation({
    summary: 'Dernières actualités urgentes (Breaking News)',
    description: 'Retourne la liste des actualités urgentes et prioritaires triées par date de publication décroissante.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Liste des actualités urgentes retournée avec succès.' })
  getBreakingNews(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.newsService.getBreakingNews(
      limit !== undefined ? Number(limit) : undefined,
      offset !== undefined ? Number(offset) : undefined,
    );
  }

  @Get('most-read')
  @ApiOperation({
    summary: 'Actualités les plus lues (Most-read)',
    description: 'Retourne les articles d’actualité les plus consultés par les utilisateurs.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Liste des articles populaires retournée avec succès.' })
  getMostRead(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.newsService.getMostRead(
      limit !== undefined ? Number(limit) : undefined,
      offset !== undefined ? Number(offset) : undefined,
    );
  }

  @Get('asset-class/:assetClass')
  @ApiOperation({
    summary: 'Actualités par classe d’actif',
    description: 'Retourne les actualités associées à une classe d’actif spécifique (equity, bond, crypto, fx, commodity).',
  })
  @ApiParam({ name: 'assetClass', enum: AssetClass, description: 'Classe d’actif' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({ status: 200, description: 'Actualités par classe d’actif retournées avec succès.' })
  getByAssetClass(
    @Param('assetClass') assetClass: AssetClass,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.newsService.getByAssetClass(
      assetClass,
      limit !== undefined ? Number(limit) : undefined,
      offset !== undefined ? Number(offset) : undefined,
    );
  }

  @Get('search')
  @ApiOperation({
    summary: 'Recherche avancée d’actualités',
    description: 'Recherche plein texte par mots-clés, ticker d’instrument lié, ID d’instrument, sentiment ou classe d’actif.',
  })
  @ApiResponse({ status: 200, description: 'Résultats de recherche retournés avec succès.' })
  searchNews(@Query() query: QueryNewsDto) {
    return this.newsService.searchNews(query);
  }

  @Get('economic-calendar')
  @ApiOperation({
    summary: 'Calendrier économique (Périodes rapides)',
    description: 'Retourne les événements économiques du calendrier selon une période prédéfinie (today, this_week, this_month, all).',
  })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'this_week', 'this_month', 'all'], example: 'this_week' })
  @ApiQuery({ name: 'country', required: false, type: String, example: 'CIV' })
  @ApiQuery({ name: 'impact', required: false, enum: EventImpact, example: EventImpact.high })
  @ApiResponse({ status: 200, description: 'Calendrier économique retourné avec succès.' })
  getEconomicCalendar(
    @Query('period') period?: 'today' | 'this_week' | 'this_month' | 'all',
    @Query('country') country?: string,
    @Query('impact') impact?: EventImpact,
  ) {
    return this.newsService.getEconomicCalendar(period, country, impact);
  }

  @Get('economic-calendar/events')
  @ApiOperation({
    summary: 'Événements économiques futurs avec filtres avancés',
    description: 'Retourne la liste des indicateurs et annonces macroéconomiques programmés avec filtres de dates et de pays.',
  })
  @ApiResponse({ status: 200, description: 'Événements économiques retournés avec succès.' })
  getEconomicEvents(@Query() query: QueryEconomicEventDto) {
    return this.newsService.getEconomicEvents(query);
  }

  @Post('economic-calendar/events')
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({
    summary: 'Ajouter un événement économique au calendrier (Admin / Analyste)',
    description: 'Crée un nouvel événement ou indicateur macro-économique dans le calendrier.',
  })
  @ApiResponse({ status: 201, description: 'Événement économique créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  createEconomicEvent(@Body() dto: CreateEconomicEventDto) {
    return this.newsService.createEconomicEvent(dto);
  }

  @Get(':id/portfolio-impact')
  @ApiOperation({
    summary: 'Analyse d’impact de l’article sur le portefeuille',
    description: 'Vérifie si les instruments rattachés à cet article sont détenus dans les portefeuilles de l’utilisateur et retourne l’exposition et le sentiment.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’article' })
  @ApiResponse({ status: 200, description: 'Impact calculé avec succès.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  getPortfolioImpact(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.newsService.getPortfolioImpact(id, user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Détail d’un article d’actualité',
    description: 'Retourne le contenu complet de l’article et ses instruments liés. Peut incrémenter les vues via ?incrementViews=true.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’article' })
  @ApiQuery({ name: 'incrementViews', required: false, type: Boolean, example: true })
  @ApiResponse({ status: 200, description: 'Article trouvé.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('incrementViews') incrementViews?: string,
  ) {
    return this.newsService.findOne(id, incrementViews === 'true');
  }

  @Post()
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({
    summary: 'Publier un article d’actualité (Admin / Analyste)',
    description: 'Crée un nouvel article d’actualité et l’associe optionnellement à des instruments financiers.',
  })
  @ApiResponse({ status: 201, description: 'Article publié avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides ou instruments introuvables.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  createArticle(@Body() createArticleDto: CreateNewsArticleDto) {
    return this.newsService.createArticle(createArticleDto);
  }

  @Patch(':id')
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({
    summary: 'Mettre à jour un article d’actualité (Admin / Analyste)',
    description: 'Modifie un article d’actualité existant et actualise ses liaisons d’instruments.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’article' })
  @ApiResponse({ status: 200, description: 'Article mis à jour avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  updateArticle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateNewsArticleDto,
  ) {
    return this.newsService.updateArticle(id, updateArticleDto);
  }

  @Delete(':id')
  @Roles(RoleUser.ADMIN, RoleUser.ANALYSTE)
  @ApiOperation({
    summary: 'Supprimer un article d’actualité (Admin / Analyste)',
    description: 'Supprime définitivement un article d’actualité.',
  })
  @ApiParam({ name: 'id', description: 'UUID de l’article' })
  @ApiResponse({ status: 200, description: 'Article supprimé avec succès.' })
  @ApiResponse({ status: 403, description: 'Accès refusé.' })
  @ApiResponse({ status: 404, description: 'Article non trouvé.' })
  deleteArticle(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.deleteArticle(id);
  }
}
