import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';
import { CurrentUser } from 'src/sig/decorators/current-user.decorator';
import type { Response } from 'express';


@ApiTags('Repports')
//@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}


  // GET /reports : liste publique
  @Public()
  @Get()
  @ApiOperation({ summary: 'Lister les rapports' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Format YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Format YYYY-MM-DD',
  })
  @ApiResponse({ status: 200, description: 'Liste des rapports' })
  findAll(@Query() filters: CreateReportDto) {
    return this.reportsService.findAll(filters);
  }

  // GET /reports/featured : rapports mis en avant
  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Lister les rapports mis en avant' })
  @ApiResponse({ status: 200, description: 'Rapports mis en avant' })
  findFeatured() {
    return this.reportsService.findFeatured();
  }

  // GET /reports/categories : catégories disponibles
  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Lister les catégories de rapports' })
  @ApiResponse({ status: 200, description: 'Catégories disponibles' })
  findCategories() {
    return this.reportsService.findCategories();
  }

  // GET /reports/bookmarks : favoris de l'utilisateur connecté
  @Get('bookmarks')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lister les favoris de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Liste des favoris' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  findBookmarks(@CurrentUser() user: any) {
    return this.reportsService.findBookmarks(user.id);
  }

  // POST /reports/:id/bookmark : ajouter aux favoris
  @Post(':id/bookmark')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Ajouter un rapport aux favoris' })
  @ApiParam({ name: 'id', description: 'UUID du rapport' })
  @ApiResponse({ status: 201, description: 'Rapport ajouté aux favoris' })
  @ApiResponse({ status: 401, description: 'Authentification requise' })
  bookmark(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.reportsService.bookmark(user.id, id);
  }

    // DELETE /reports/:id/bookmark : retirer des favoris
    @Delete(':id/bookmark')
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Retirer un rapport des favoris' })
    @ApiParam({ name: 'id', description: 'UUID du rapport' })
    @ApiResponse({ status: 200, description: 'Rapport retiré des favoris' })
    removeBookmark(
      @Param('id', ParseUUIDPipe) id: string,
      @CurrentUser() user: any,
    ) {
      return this.reportsService.removeBookmark(user.id, id);
    }

     // GET /reports/:id/download : téléchargement protégé
  
     @Get(':id/download')
     @ApiBearerAuth('access-token')
     @ApiOperation({
       summary: 'Télécharger un rapport',
       description: 'Redirige vers le fichier du rapport après authentification.',
     })
     @ApiParam({ name: 'id', description: 'UUID du rapport' })
     @ApiResponse({ status: 302, description: 'Redirection vers le fichier' })
     async download(
       @Param('id', ParseUUIDPipe) id: string,
       @Res() response: Response,
     ): Promise<void> {
       const url = await this.reportsService.getDownloadUrl(id);
       response.redirect(302, url);
     }
   

  // GET /reports/:id : détail public
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Consulter un rapport' })
  @ApiParam({ name: 'id', description: 'UUID du rapport' })
  @ApiResponse({ status: 200, description: 'Détail du rapport' })
  @ApiResponse({ status: 404, description: 'Rapport introuvable' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findOne(id);
  }
}
