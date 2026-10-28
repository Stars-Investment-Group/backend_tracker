import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PolicyService {

  constructor(private readonly databaseService: DatabaseService) {}
  
  /**
   * Dernier résumé mondial enregistré.
   */
  async getSummary() {
    const summary =
      await this.databaseService.globalPolicySummary.findFirst({
        orderBy: [
          { period: 'desc' },
          { createdAt: 'desc' },
        ],
      });

    if (!summary) {
      return {
        narrative: null,
        cutsCount: 0,
        banksFollowed: 0,
        globalRateCorridor: null,
        period: null,
      };
    }

    return {
      narrative: summary.narrative,
      cutsCount: summary.cutsCount,
      banksFollowed: summary.banksFollowed,
      globalRateCorridor: summary.globalRateCorridor,
      period: summary.period,
    };
  }

  /**
   * Liste des banques centrales et résumé mondial.
   */
  async getCentralBanks() {
    const [summary, banks] = await Promise.all([
      this.getSummary(),
      this.databaseService.centralBank.findMany({
        orderBy: { code: 'asc' },
        include: {
          country: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      summary,
      banks: banks.map((bank) => ({
        code: bank.code,
        name: bank.name,
        countryCode: bank.countryCode,
        country: bank.country,
        region: bank.region,
        currentRate:
          bank.currentRate !== null
            ? Number(bank.currentRate)
            : null,
        lastChangeBps:
          bank.lastChangeBps !== null
            ? Number(bank.lastChangeBps)
            : null,
        lastChangeDate: bank.lastChangeDate,
        stance: bank.stance,
        lastUpdated: bank.lastUpdated,
      })),
    };
  }

  /**
   * Historique récent de toutes les banques.
   */
  async getActions() {
    const actions = await this.databaseService.policyAction.findMany({
      orderBy: [
        { actionDate: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
      include: {
        centralBank: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    });

    return actions.map((action) => ({
      id: action.id,
      bankCode: action.centralBank.code,
      bankName: action.centralBank.name,
      actionDate: action.actionDate,
      actionType: action.actionType,
      rateBefore:
        action.rateBefore !== null
          ? Number(action.rateBefore)
          : null,
      rateAfter:
        action.rateAfter !== null
          ? Number(action.rateAfter)
          : null,
      changeBps:
        action.changeBps !== null
          ? Number(action.changeBps)
          : null,
      rationale: action.rationale,
    }));
  }

  /**
   * Historique d'une banque centrale identifiée par son code.
   */
  async getActionsByBankCode(bankCode: string) {
    const bank = await this.databaseService.centralBank.findUnique({
      where: { code: bankCode.toUpperCase() },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!bank) {
      throw new NotFoundException(
        `Banque centrale "${bankCode}" introuvable.`,
      );
    }

    const actions = await this.databaseService.policyAction.findMany({
      where: { centralBankId: bank.id },
      orderBy: [
        { actionDate: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    });

    return {
      bank,
      actions: actions.map((action) => ({
        id: action.id,
        actionDate: action.actionDate,
        actionType: action.actionType,
        rateBefore:
          action.rateBefore !== null
            ? Number(action.rateBefore)
            : null,
        rateAfter:
          action.rateAfter !== null
            ? Number(action.rateAfter)
            : null,
        changeBps:
          action.changeBps !== null
            ? Number(action.changeBps)
            : null,
        rationale: action.rationale,
      })),
    };
  }

  /**
   * Légende des orientations monétaires.
   */
  getStanceLegend() {
    return [
      {
        code: 'restrictive',
        label: 'Restrictive',
        description:
          'Le taux directeur est supérieur au taux neutre.',
      },
      {
        code: 'neutral',
        label: 'Neutre',
        description:
          'Le taux directeur est égal au taux neutre.',
      },
      {
        code: 'accommodative',
        label: 'Accommodante',
        description:
          'Le taux directeur est inférieur au taux neutre.',
      },
    ];
  }
}
