import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssetClass, EventImpact, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { QueryNewsDto } from './dto/query-news.dto';
import { CreateEconomicEventDto } from './dto/create-economic-event.dto';
import { QueryEconomicEventDto } from './dto/query-economic-event.dto';

@Injectable()
export class NewsService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Créer un article d'actualité avec liaison optionnelle aux instruments financiers
   */
  async createArticle(createNewsArticleDto: CreateNewsArticleDto) {
    const { instrumentIds, ...articleData } = createNewsArticleDto;

    // Vérifier l'existence des instruments spécifiés
    if (instrumentIds && instrumentIds.length > 0) {
      const existingInstruments = await this.databaseService.instrument.findMany({
        where: { id: { in: instrumentIds } },
        select: { id: true },
      });

      if (existingInstruments.length !== instrumentIds.length) {
        throw new BadRequestException(
          'Un ou plusieurs identifiants d\'instruments financiers sont invalides ou introuvables.',
        );
      }
    }

    return this.databaseService.newsArticle.create({
      data: {
        ...articleData,
        instruments: instrumentIds && instrumentIds.length > 0
          ? {
              create: instrumentIds.map((instrumentId) => ({
                instrument: { connect: { id: instrumentId } },
              })),
            }
          : undefined,
      },
      include: {
        instruments: {
          include: {
            instrument: true,
          },
        },
      },
    });
  }

  /**
   * Récupérer les actualités urgentes / flash (Breaking News)
   */
  async getBreakingNews(limit: number = 10, offset: number = 0) {
    const [total, data] = await Promise.all([
      this.databaseService.newsArticle.count({
        where: { isBreaking: true },
      }),
      this.databaseService.newsArticle.findMany({
        where: { isBreaking: true },
        include: {
          instruments: {
            include: {
              instrument: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, limit, offset, data };
  }

  /**
   * Récupérer les articles les plus lus (Most-read)
   */
  async getMostRead(limit: number = 10, offset: number = 0) {
    const [total, data] = await Promise.all([
      this.databaseService.newsArticle.count(),
      this.databaseService.newsArticle.findMany({
        include: {
          instruments: {
            include: {
              instrument: true,
            },
          },
        },
        orderBy: [{ readCount: 'desc' }, { publishedAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, limit, offset, data };
  }

  /**
   * Récupérer les actualités par classe d'actifs
   */
  async getByAssetClass(assetClass: AssetClass, limit: number = 20, offset: number = 0) {
    const [total, data] = await Promise.all([
      this.databaseService.newsArticle.count({
        where: { assetClass },
      }),
      this.databaseService.newsArticle.findMany({
        where: { assetClass },
        include: {
          instruments: {
            include: {
              instrument: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, limit, offset, data };
  }

  /**
   * Recherche avancée d'actualités (recherche textuelle, ticker, instrument, sentiment, etc.)
   */
  async searchNews(query: QueryNewsDto) {
    const {
      q,
      ticker,
      instrumentId,
      assetClass,
      sentiment,
      isBreaking,
      limit = 20,
      offset = 0,
    } = query;

    const where: Prisma.NewsArticleWhereInput = {};

    // Recherche plein texte sur titre, résumé ou contenu
    if (q && q.trim().length > 0) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (assetClass) {
      where.assetClass = assetClass;
    }

    if (sentiment) {
      where.sentiment = sentiment;
    }

    if (isBreaking !== undefined) {
      where.isBreaking = isBreaking;
    }

    // Filtrage par instrument lié ou ticker
    if (instrumentId || ticker) {
      where.instruments = {
        some: {
          instrument: {
            ...(instrumentId ? { id: instrumentId } : {}),
            ...(ticker ? { ticker: { equals: ticker, mode: 'insensitive' } } : {}),
          },
        },
      };
    }

    const [total, data] = await Promise.all([
      this.databaseService.newsArticle.count({ where }),
      this.databaseService.newsArticle.findMany({
        where,
        include: {
          instruments: {
            include: {
              instrument: true,
            },
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, limit, offset, data };
  }

  /**
   * Consulter un article par son ID (avec incrémentation optionnelle du compteur de lectures)
   */
  async findOne(id: string, incrementViews: boolean = false) {
    if (incrementViews) {
      try {
        return await this.databaseService.newsArticle.update({
          where: { id },
          data: {
            readCount: { increment: 1 },
          },
          include: {
            instruments: {
              include: {
                instrument: true,
              },
            },
          },
        });
      } catch {
        throw new NotFoundException(`Article avec l'ID ${id} non trouvé`);
      }
    }

    const article = await this.databaseService.newsArticle.findUnique({
      where: { id },
      include: {
        instruments: {
          include: {
            instrument: true,
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article avec l'ID ${id} non trouvé`);
    }

    return article;
  }

  /**
   * Mettre à jour un article d'actualité
   */
  async updateArticle(id: string, updateNewsArticleDto: UpdateNewsArticleDto) {
    await this.findOne(id, false);

    const { instrumentIds, ...articleData } = updateNewsArticleDto;

    // Si une liste d'instruments est fournie, valider et réassocier
    if (instrumentIds !== undefined) {
      if (instrumentIds.length > 0) {
        const existingInstruments = await this.databaseService.instrument.findMany({
          where: { id: { in: instrumentIds } },
          select: { id: true },
        });

        if (existingInstruments.length !== instrumentIds.length) {
          throw new BadRequestException(
            'Un ou plusieurs identifiants d\'instruments sont invalides.',
          );
        }
      }

      // Supprimer les anciennes associations et recréer les nouvelles
      await this.databaseService.newsInstrument.deleteMany({
        where: { newsId: id },
      });

      if (instrumentIds.length > 0) {
        await this.databaseService.newsInstrument.createMany({
          data: instrumentIds.map((instrumentId) => ({
            newsId: id,
            instrumentId,
          })),
        });
      }
    }

    return this.databaseService.newsArticle.update({
      where: { id },
      data: articleData,
      include: {
        instruments: {
          include: {
            instrument: true,
          },
        },
      },
    });
  }

  /**
   * Supprimer définitivement un article
   */
  async deleteArticle(id: string) {
    await this.findOne(id, false);

    await this.databaseService.newsArticle.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Article supprimé avec succès',
    };
  }

  /**
   * Calculer l'impact d'une actualité sur le portefeuille de l'utilisateur connecté
   */
  async getPortfolioImpact(newsId: string, user: any) {
    const article = await this.findOne(newsId, false);

    const instrumentIds = article.instruments.map((item) => item.instrumentId);

    if (instrumentIds.length === 0) {
      return {
        impacted: false,
        sentiment: article.sentiment,
        message:
          'Cet article est une actualité macro-économique ou générale sans instrument financier directement rattaché.',
        article: {
          id: article.id,
          title: article.title,
          sentiment: article.sentiment,
        },
        impactedPositions: [],
      };
    }

    // Récupérer les positions de l'utilisateur pour les instruments concernés
    // via les transactions des portefeuilles appartenant à l'utilisateur
    const userPortfolios = await this.databaseService.portfolio.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
    });

    if (userPortfolios.length === 0) {
      return {
        impacted: false,
        sentiment: article.sentiment,
        message: "L'utilisateur ne possède aucun portefeuille actif.",
        article: {
          id: article.id,
          title: article.title,
          sentiment: article.sentiment,
        },
        impactedPositions: [],
      };
    }

    const portfolioIds = userPortfolios.map((p) => p.id);

    // Calculer les positions nettes détenues
    const transactions = await this.databaseService.transaction.findMany({
      where: {
        portfolioId: { in: portfolioIds },
        instrumentId: { in: instrumentIds },
      },
      include: {
        instrument: true,
        portfolio: { select: { id: true, name: true } },
      },
    });

    // Agréger la quantité nette par instrument et par portefeuille
    const positionMap = new Map<
      string,
      {
        instrumentId: string;
        ticker: string | null;
        instrumentName: string;
        portfolioId: string;
        portfolioName: string;
        netQuantity: number;
      }
    >();

    for (const tx of transactions) {
      const key = `${tx.portfolioId}_${tx.instrumentId}`;
      const qty = Number(tx.quantity);
      const factor = tx.transactionType === 'buy' ? 1 : tx.transactionType === 'sell' ? -1 : 0;

      if (!positionMap.has(key)) {
        positionMap.set(key, {
          instrumentId: tx.instrumentId,
          ticker: tx.instrument.ticker,
          instrumentName: tx.instrument.name,
          portfolioId: tx.portfolio.id,
          portfolioName: tx.portfolio.name,
          netQuantity: factor * qty,
        });
      } else {
        const item = positionMap.get(key)!;
        item.netQuantity += factor * qty;
      }
    }

    // Filtrer uniquement les positions avec quantité nette positive
    const activePositions = Array.from(positionMap.values()).filter(
      (pos) => pos.netQuantity > 0,
    );

    const isImpacted = activePositions.length > 0;

    return {
      impacted: isImpacted,
      sentiment: article.sentiment,
      message: isImpacted
        ? `Cet article concerne ${activePositions.length} position(s) active(s) dans vos portefeuilles.`
        : "Vous ne détenez actuellement aucune position sur les instruments concernés par cette actualité.",
      article: {
        id: article.id,
        title: article.title,
        summary: article.summary,
        sentiment: article.sentiment,
        publishedAt: article.publishedAt,
      },
      impactedPositions: activePositions,
    };
  }

  /**
   * Récupérer le calendrier économique avec filtres de période rapide
   */
  async getEconomicCalendar(
    period?: 'today' | 'this_week' | 'this_month' | 'all',
    country?: string,
    impact?: EventImpact,
  ) {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (period === 'today') {
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    } else if (period === 'this_week') {
      const day = now.getUTCDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday, 0, 0, 0));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday + 6, 23, 59, 59, 999));
    } else if (period === 'this_month') {
      startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
      endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }

    const where: Prisma.EconomicEventWhereInput = {
      ...(startDate && endDate ? { eventDate: { gte: startDate, lte: endDate } } : {}),
      ...(country ? { country: { equals: country, mode: 'insensitive' } } : {}),
      ...(impact ? { impact } : {}),
    };

    const events = await this.databaseService.economicEvent.findMany({
      where,
      orderBy: {
        eventDate: 'asc',
      },
    });

    return {
      period: period ?? 'all',
      count: events.length,
      data: events,
    };
  }

  /**
   * Récupérer les événements économiques futurs avec filtres avancés
   */
  async getEconomicEvents(query: QueryEconomicEventDto) {
    const { country, impact, startDate, endDate, limit = 50, offset = 0 } = query;

    const where: Prisma.EconomicEventWhereInput = {
      ...(country ? { country: { equals: country, mode: 'insensitive' } } : {}),
      ...(impact ? { impact } : {}),
      ...(startDate || endDate
        ? {
            eventDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      this.databaseService.economicEvent.count({ where }),
      this.databaseService.economicEvent.findMany({
        where,
        orderBy: {
          eventDate: 'asc',
        },
        take: limit,
        skip: offset,
      }),
    ]);

    return { total, limit, offset, data };
  }

  /**
   * Créer un événement économique dans le calendrier
   */
  async createEconomicEvent(dto: CreateEconomicEventDto) {
    return this.databaseService.economicEvent.create({
      data: dto,
    });
  }
}
