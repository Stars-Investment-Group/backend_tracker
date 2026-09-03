import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';

@Injectable()
export class WatchlistsService {

  constructor(private readonly databaseService: DatabaseService) {}


  async create(createWatchlistDto: CreateWatchlistDto, userId: string) {
    return this.databaseService.watchlist.create({
      data: {
        userId,
        name: createWatchlistDto.name,
        isActive: createWatchlistDto.isActive ?? true,
      },
    });
  }

  async findAll(userId: string) {
    return this.databaseService.watchlist.findMany({
      where: {
        userId,
      },
      include: {
        instruments: {
          include: {
            instrument: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(
    userId: string,
    watchlistId: string,
  ) {
    const watchlist =
      await this.databaseService.watchlist.findUnique({
        where: {
          id: watchlistId,
        },
        include: {
          instruments: {
            include: {
              instrument: true,
            },
          },
        },
      });

    if (!watchlist) {
      throw new NotFoundException(
        'Watchlist introuvable',
      );
    }

    if (watchlist.userId !== userId) {
      throw new ForbiddenException(
        'Vous n\'avez pas accès à cette watchlist',
      );
    }

    return watchlist;
  }

  async update(
    userId: string,
    watchlistId: string,
    updateWatchlistDto: UpdateWatchlistDto,
  ) {
    await this.findOne(userId, watchlistId);

    return this.databaseService.watchlist.update({
      where: {
        id: watchlistId,
      },
      data: updateWatchlistDto,
    });
  }

  async remove(
    userId: string,
    watchlistId: string,
  ) {
    await this.findOne(userId, watchlistId);

    await this.databaseService.watchlist.delete({
      where: {
        id: watchlistId,
      },
    });

    return {
      success: true,
      message: 'Watchlist supprimée avec succès',
    };
  }

  async addInstrument(
    userId: string,
    watchlistId: string,
    instrumentId: string,
  ) {
    // Vérifier que la watchlist appartient
    // à l'utilisateur connecté.
    await this.findOne(userId, watchlistId);

    // Vérifier que l'instrument existe.
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

    // Vérifier si l'instrument est déjà présent.
    const existing =
      await this.databaseService.watchlistInstrument.findUnique({
        where: {
          watchlistId_instrumentId: {
            watchlistId,
            instrumentId,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        'Cet instrument est déjà dans la watchlist',
      );
    }

    return this.databaseService.watchlistInstrument.create({
      data: {
        watchlistId,
        instrumentId,
      },
      include: {
        instrument: true,
      },
    });
  }

  async getInstruments(
    userId: string,
    watchlistId: string,
  ) {
    await this.findOne(userId, watchlistId);

    const items =
      await this.databaseService.watchlistInstrument.findMany({
        where: {
          watchlistId,
        },
        include: {
          instrument: true,
        },
      });

    return items.map((item) => item.instrument);
  }

  async removeInstrument(
    userId: string,
    watchlistId: string,
    instrumentId: string,
  ) {
    await this.findOne(userId, watchlistId);

    const existing =
      await this.databaseService.watchlistInstrument.findUnique({
        where: {
          watchlistId_instrumentId: {
            watchlistId,
            instrumentId,
          },
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Cet instrument n\'est pas dans cette watchlist',
      );
    }

    await this.databaseService.watchlistInstrument.delete({
      where: {
        watchlistId_instrumentId: {
          watchlistId,
          instrumentId,
        },
      },
    });

    return {
      success: true,
      message: 'Instrument retiré de la watchlist',
    };
  }
}
