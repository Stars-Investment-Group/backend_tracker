import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateAlertMacroDto } from './dto/create-alert-macro.dto';
import { UpdateAlertMacroDto } from './dto/update-alert-macro.dto';
import { CreateAlertSubscriptionDto } from './dto/create-alert-subscription.dto';

const ALERT_CATEGORIES = [
  'Régime',
  'Rating',
  'Marché',
  'Policy',
  'Data',
] as const;

const ALERT_SEVERITIES = [
  'critique',
  'avertissement',
  'information',
  'positif',
] as const;

@Injectable()
export class AlertMacroService {

  constructor(private readonly databaseservice: DatabaseService) {}


  /**
   * Liste les alertes actives de l'utilisateur.
   * isRead = true  : alertes lues
   * isRead = false : alertes non lues
   * isRead absent  : toutes les alertes
   */
  async findAll(
    userId: string,
    filters: {
      category?: string;
      severity?: string;
      isRead?: string;
    },
  ) {
    const where: any = {
      isActive: true,
    };

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.isRead !== undefined && filters.isRead !== '') {
      if (!['true', 'false'].includes(filters.isRead)) {
        throw new BadRequestException(
          'Le paramètre isRead doit être true ou false.',
        );
      }

      where.reads = filters.isRead === 'true'
        ? { some: { userId } }
        : { none: { userId } };
    }

    const alerts = await this.databaseservice.alertMacro.findMany({
      where,
      include: {
        country: {
          select: {
            code: true,
            name: true,
          },
        },
        reads: {
          where: { userId },
          select: {
            alertId: true,
          },
        },
      },
      orderBy: {
        triggeredAt: 'desc',
      },
    });

    return alerts.map((alert) => {
      const { reads, country, ...data } = alert;

      return {
        ...data,
        countryName: country?.name ?? null,
        isRead: reads.length > 0,
      };
    });
  }

  /**
   * Retourne les statistiques des alertes actives.
   */
  async getSummary(userId: string) {
    const [grouped, total, unread] = await Promise.all([
      this.databaseservice.alertMacro.groupBy({
        by: ['severity'],
        where: { isActive: true },
        _count: {
          _all: true,
        },
      }),

      this.databaseservice.alertMacro.count({
        where: { isActive: true },
      }),

      this.databaseservice.alertMacro.count({
        where: {
          isActive: true,
          reads: {
            none: { userId },
          },
        },
      }),
    ]);

    const counts = {
      critique: 0,
      avertissement: 0,
      information: 0,
      positif: 0,
    };

    for (const item of grouped) {
      if (item.severity in counts) {
        counts[item.severity as keyof typeof counts] = item._count._all;
      }
    }

    return {
      total,
      unread,
      read: total - unread,
      bySeverity: counts,
    };
  }

  /**
   * Retourne uniquement les alertes non lues.
   */
  async findUnread(userId: string) {
    return this.findAll(userId, { isRead: 'false' });
  }

  /**
   * Marque une alerte comme lue pour l'utilisateur connecté.
   */
  async markAsRead(userId: string, alertId: string) {
    const alert = await this.databaseservice.alertMacro.findFirst({
      where: {
        id: alertId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!alert) {
      throw new NotFoundException('Alerte introuvable.');
    }

    await this.databaseservice.alertRead.upsert({
      where: {
        userId_alertId: {
          userId,
          alertId,
        },
      },
      create: {
        userId,
        alertId,
      },
      update: {},
    });

    return {
      message: 'Alerte marquée comme lue.',
      alertId,
      isRead: true,
    };
  }

  /**
   * Marque toutes les alertes actives comme lues.
   */
  async markAllAsRead(userId: string) {
    const unreadAlerts = await this.databaseservice.alertMacro.findMany({
      where: {
        isActive: true,
        reads: {
          none: { userId },
        },
      },
      select: {
        id: true,
      },
    });

    if (unreadAlerts.length === 0) {
      return {
        message: 'Aucune nouvelle alerte à marquer comme lue.',
        count: 0,
      };
    }

    const result = await this.databaseservice.alertRead.createMany({
      data: unreadAlerts.map((alert) => ({
        userId,
        alertId: alert.id,
      })),
      skipDuplicates: true,
    });

    return {
      message: 'Toutes les alertes ont été marquées comme lues.',
      count: result.count,
    };
  }

  /**
   * Liste les abonnements de l'utilisateur connecté.
   */
  async findSubscriptions(userId: string) {
    return this.databaseservice.alertSubscription.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Crée un abonnement aux alertes.
   */
  async createSubscription(
    userId: string,
    dto: CreateAlertSubscriptionDto,
  ) {
    if (
      dto.category &&
      !ALERT_CATEGORIES.some((category) => category === dto.category)
    ) {
      throw new BadRequestException('Catégorie d’alerte invalide.');
    }

    if (
      dto.minSeverity &&
      !ALERT_SEVERITIES.some((severity) => severity === dto.minSeverity)
    ) {
      throw new BadRequestException('Niveau de sévérité invalide.');
    }

    const countryCode = dto.countryCode?.trim().toUpperCase() || null;
    const category = dto.category || null;
    const minSeverity = dto.minSeverity || null;

    if (countryCode && countryCode.length !== 3) {
      throw new BadRequestException(
        'Le code pays doit contenir exactement 3 caractères.',
      );
    }

    // Vérification des doublons, y compris lorsque les champs sont NULL.
    const existing = await this.databaseservice.alertSubscription.findFirst({
      where: {
        userId,
        category,
        countryCode,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Un abonnement avec ces critères existe déjà.',
      );
    }

    return this.databaseservice.alertSubscription.create({
      data: {
        userId,
        category,
        countryCode,
        minSeverity,
      },
    });
  }

  /**
   * Supprime uniquement un abonnement appartenant à l'utilisateur.
   */
  async deleteSubscription(userId: string, subscriptionId: string) {
    const result = await this.databaseservice.alertSubscription.deleteMany({
      where: {
        id: subscriptionId,
        userId,
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Abonnement introuvable.');
    }

    return {
      message: 'Abonnement supprimé.',
      subscriptionId,
    };
  }
}
