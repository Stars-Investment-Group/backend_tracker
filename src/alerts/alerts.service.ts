import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertsService {

  constructor(private readonly databaseService: DatabaseService) {}


  async create(createAlertDto: CreateAlertDto, userId: any) {
    const {
      instrumentId,
      alertType,
      condition,
      isActive,
    } = createAlertDto;

    // Si un instrument est fourni,
    // vérifier qu'il existe.
    if (instrumentId) {
      const instrument =
        await this.databaseService.instrument.findUnique({
          where: {
            id: instrumentId,
          },
        });

      if (!instrument) {
        throw new NotFoundException(
          'Instrument introuvable',
        );
      }
      
    }

    return this.databaseService.alert.create({
      data: {
        userId,
        instrumentId,
        alertType,
        condition,
        isActive: isActive ?? true,
      },
      include: {
        instrument: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.databaseService.alert.findMany({
      where: {
        userId,
      },
      include: {
        instrument: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const alert =
      await this.databaseService.alert.findUnique({
        where: {
          id,
        },
        include: {
          instrument: true,
        },
      });

    if (!alert) {
      throw new NotFoundException(
        'Alerte introuvable',
      );
    }

    // Vérifier que l'alerte appartient
    // bien à l'utilisateur connecté.
    if (alert.userId !== userId) {
      throw new ForbiddenException(
        'Vous n\'avez pas accès à cette alerte',
      );
    }

    return alert;
  }

  async update(
    userId: string,
    id: string,
    updateAlertDto: UpdateAlertDto,
  ) {
    const alert =
      await this.databaseService.alert.findUnique({
        where: {
          id,
        },
      });

    if (!alert) {
      throw new NotFoundException(
        'Alerte introuvable',
      );
    }

    if (alert.userId !== userId) {
      throw new ForbiddenException(
        'Vous n\'avez pas accès à cette alerte',
      );
    }

    // Vérifier l'instrument s'il est modifié.
    if (updateAlertDto.instrumentId) {
      const instrument =
        await this.databaseService.instrument.findUnique({
          where: {
            id: updateAlertDto.instrumentId,
          },
        });

      if (!instrument) {
        throw new NotFoundException(
          'Instrument introuvable',
        );
      }
    }

    return this.databaseService.alert.update({
      where: {
        id,
      },
      data: updateAlertDto,
      include: {
        instrument: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    const alert =
      await this.databaseService.alert.findUnique({
        where: {
          id,
        },
      });

    if (!alert) {
      throw new NotFoundException(
        'Alerte introuvable',
      );
    }

    if (alert.userId !== userId) {
      throw new ForbiddenException(
        'Vous n\'avez pas accès à cette alerte',
      );
    }

    await this.databaseService.alert.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Alerte supprimée avec succès',
    };
  }
}
