import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Enregistre une action dans la table audit_logs
   */
  async log(params: CreateAuditLogParams) {
    try {
      const data: Prisma.AuditLogCreateInput = {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        oldValues: params.oldValues ? (params.oldValues as Prisma.InputJsonValue) : Prisma.JsonNull,
        newValues: params.newValues ? (params.newValues as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      };

      if (params.userId) {
        data.user = { connect: { id: params.userId } };
      }

      return await this.databaseService.auditLog.create({ data });
    } catch (error) {
      // On logge l'erreur sans faire échouer l'opération métier principale
      this.logger.error(`Échec de l'enregistrement de l'audit log: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Récupère l'historique des audits avec pagination optionnelle
   */
  async findAll(options?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    take?: number;
    skip?: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {};

    if (options?.userId) where.userId = options.userId;
    if (options?.entityType) where.entityType = options.entityType;
    if (options?.entityId) where.entityId = options.entityId;

    return this.databaseService.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.take ?? 50,
      skip: options?.skip ?? 0,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }
}
