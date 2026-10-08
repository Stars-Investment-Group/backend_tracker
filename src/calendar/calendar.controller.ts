import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';


@ApiTags('Calndrier et évènements')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Public()
  @Get('events')
  async getEvents(
    @Query('date') date?: string,
    @Query('region') region?: string,
    @Query('impact') impact?: string,
  ) {
    return this.calendarService.getEvents({
      date,
      region,
      impact,
    });
  }

  @Public()
  @Get('events/upcoming')
  async getUpcomingEvents() {
    return this.calendarService.getUpcomingEvents();
  }

  @Public()
  @Get('releases')
  async getReleases() {
    return this.calendarService.getReleases();
  }

  @Public()
  @Get('releases/:indicator')
  async getReleasesByIndicator(
    @Param('indicator') indicator: string,
  ) {
    return this.calendarService.getReleasesByIndicator(
      indicator,
    );
  }
}
