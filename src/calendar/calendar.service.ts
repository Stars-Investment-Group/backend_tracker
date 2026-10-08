import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

interface EventFilters {
  date?: string;
  region?: string;
  impact?: string;
}

@Injectable()
export class CalendarService {

  constructor(private readonly databaseService: DatabaseService) {}


  async getEvents(filters: EventFilters) {
    //const where: any = {};
    const where: Prisma.EventWhereInput = {};

    if (filters.date) {
      const date = new Date(filters.date);

      where.eventDate = date;
    }

    if (filters.region) {
      where.regionCode = filters.region.toUpperCase();
    }

    if (filters.impact) {
      where.impact = filters.impact;
    }

    const events = await this.databaseService.event.findMany({
      where,
      include: {
        country: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          eventDate: 'asc',
        },
        {
          eventTime: 'asc',
        },
      ],
    });

    return {
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        eventType: event.eventType,
        description: event.description,
        countryCode: event.countryCode,
        countryName: event.country?.name ?? null,
        region: event.regionCode,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        impact: event.impact,
        importance: event.importance,
        source: event.source,
      })),
    };
  }

  async getUpcomingEvents() {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const events = await this.databaseService.event.findMany({
      where: {
        eventDate: {
          gte: today,
        },
      },
      include: {
        country: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          eventDate: 'asc',
        },
        {
          eventTime: 'asc',
        },
      ],
      take: 20,
    });

    return {
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        eventType: event.eventType,
        description: event.description,
        countryCode: event.countryCode,
        countryName: event.country?.name ?? null,
        region: event.regionCode,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        impact: event.impact,
        importance: event.importance,
        source: event.source,
      })),
    };
  }

  async getReleases() {
    const releases = await this.databaseService.dataRelease.findMany({
      include: {
        indicator: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true,
            frequency: true,
          },
        },
        country: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        releaseDate: 'desc',
      },
    });

    return {
      releases: releases.map((release) => ({
        id: release.id,
        indicator: release.indicator,
        countryCode: release.countryCode,
        countryName: release.country.name,
        releaseDate: release.releaseDate,
        period: release.period,
        status: release.status,
        actualValue: release.actualValue
          ? Number(release.actualValue)
          : null,
        previousValue: release.previousValue
          ? Number(release.previousValue)
          : null,
      })),
    };
  }

  async getReleasesByIndicator(indicator: string) {
    const macroIndicator =
      await this.databaseService.macroIndicator.findFirst({
        where: {
          OR: [
            {
              id: indicator,
            },
            {
              code: indicator,
            },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          unit: true,
          frequency: true,
        },
      });

    if (!macroIndicator) {
      throw new NotFoundException(
        `Indicateur ${indicator} introuvable`,
      );
    }

    const releases =
      await this.databaseService.dataRelease.findMany({
        where: {
          indicatorId: macroIndicator.id,
        },
        include: {
          country: {
            select: {
              code: true,
              name: true,
            },
          },
        },
        orderBy: {
          releaseDate: 'desc',
        },
      });

    return {
      indicator: macroIndicator,
      releases: releases.map((release) => ({
        id: release.id,
        countryCode: release.countryCode,
        countryName: release.country.name,
        releaseDate: release.releaseDate,
        period: release.period,
        status: release.status,
        actualValue: release.actualValue
          ? Number(release.actualValue)
          : null,
        previousValue: release.previousValue
          ? Number(release.previousValue)
          : null,
      })),
    };
  }
}
