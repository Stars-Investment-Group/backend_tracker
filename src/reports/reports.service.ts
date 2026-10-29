import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Injectable()
export class ReportsService {

  constructor(private readonly databaSeservice : DatabaseService) {}
  

  /**
   * GET /reports
   * Liste les rapports actifs avec filtres et tri.
   */
  async findAll(filters: CreateReportDto = {}) {
    const where: any = {
      isActive: true,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.startDate || filters.endDate) {
      where.publishDate = {};

      if (filters.startDate) {
        const startDate = this.parseDate(
          filters.startDate,
          'Date de début',
        );
        where.publishDate.gte = startDate;
      }

      if (filters.endDate) {
        const endDate = this.parseDate(
          filters.endDate,
          'Date de fin',
        );
        where.publishDate.lte = endDate;
      }

      if (
        filters.startDate &&
        filters.endDate &&
        where.publishDate.gte > where.publishDate.lte
      ) {
        throw new BadRequestException(
          'La date de début doit être antérieure ou égale à la date de fin',
        );
      }
    }

    const reports = await this.databaSeservice.report.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { publishDate: 'desc' },
      ],
    });

    return {
      data: reports,
      total: reports.length,
    };
  }

  /**
   * GET /reports/featured
   * Rapports mis en avant.
   */
  async findFeatured() {
    const reports = await this.databaSeservice.report.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: {
        publishDate: 'desc',
      },
    });

    return {
      data: reports,
      total: reports.length,
    };
  }

  /**
   * GET /reports/categories
   * Catégories présentes dans les rapports actifs.
   */
  async findCategories() {
    const categories = await this.databaSeservice.report.findMany({
      where: {
        isActive: true,
      },
      distinct: ['category'],
      select: {
        category: true,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return categories.map((item) => item.category);
  }

  /**
   * GET /reports/:id
   * Détail d'un rapport actif.
   */
  async findOne(id: string) {
    const report = await this.databaSeservice.report.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Rapport introuvable');
    }

    return report;
  }

  /**
   * GET /reports/:id/download
   * Renvoie l'URL du fichier à télécharger.
   * Le contrôleur effectue ensuite la redirection HTTP.
   */
  async getDownloadUrl(id: string): Promise<string> {
    const report = await this.findOne(id);

    if (!report.fileUrl) {
      throw new NotFoundException(
        'Aucun fichier disponible pour ce rapport',
      );
    }

    let url: URL;

    try {
      url = new URL(report.fileUrl);
    } catch {
      throw new BadRequestException(
        'URL du fichier invalide',
      );
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new BadRequestException(
        'Le fichier doit utiliser une URL HTTP ou HTTPS',
      );
    }

    return report.fileUrl;
  }

  /**
   * POST /reports/:id/bookmark
   * Ajoute un rapport aux favoris de l'utilisateur connecté.
   */
  async bookmark(userId: string, reportId: string) {
    await this.findOne(reportId);

    return this.databaSeservice.reportBookmark.upsert({
      where: {
        userId_reportId: {
          userId,
          reportId,
        },
      },
      create: {
        userId,
        reportId,
      },
      update: {},
    });
  }

  /**
   * DELETE /reports/:id/bookmark
   * Retire un rapport des favoris.
   */
  async removeBookmark(userId: string, reportId: string) {
    await this.databaSeservice.reportBookmark.deleteMany({
      where: {
        userId,
        reportId,
      },
    });

    return {
      message: 'Rapport retiré des favoris',
    };
  }

  /**
   * GET /reports/bookmarks
   * Favoris de l'utilisateur connecté.
   */
  async findBookmarks(userId: string) {
    const bookmarks = await this.databaSeservice.reportBookmark.findMany({
      where: {
        userId,
        report: {
          isActive: true,
        },
      },
      include: {
        report: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: bookmarks.map((bookmark) => ({
        ...bookmark.report,
        bookmarkedAt: bookmark.createdAt,
      })),
      total: bookmarks.length,
    };
  }

  private parseDate(value: string, label: string): Date {
    // Accepte uniquement une date au format YYYY-MM-DD.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(
        `${label} invalide : utilisez le format YYYY-MM-DD`,
      );
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new BadRequestException(`${label} invalide`);
    }

    return date;
  }
}
