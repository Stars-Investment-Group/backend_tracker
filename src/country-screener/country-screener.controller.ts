import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/sig/decorators/public.decorator';
import { CountryScreenerService } from './country-screener.service';
import { CreateCountryScreenerDto } from './dto/create-country-screener.dto';
import { UpdateCountryScreenerDto } from './dto/update-country-screener.dto';
import type { Response } from 'express';


@ApiTags('Country Screener')
@Controller('country-screener')
export class CountryScreenerController {
  constructor(private readonly countryScreenerService: CountryScreenerService) {}


  @Public()
  @Get()
  @ApiOperation({
    summary: 'Screener avec filtres',
    description: 'Retourne le screener par filtre',
  })
  @ApiResponse({
    status: 200,
    description: 'Screener retourné avec succès',
  })
  findCountries(
    @Query() query: CreateCountryScreenerDto,
  ) {
    return this.countryScreenerService.findCountries(
      query,
    );
  }

  @Public()
  @Get('rankings')
  @ApiOperation({
    summary: 'Classements par critère',
    description: 'Retourne le classement par critère',
  })
  @ApiResponse({
    status: 200,
    description: 'Classement retourné avec succès',
  })
  getRankings(
    @Query() query: CreateCountryScreenerDto,
  ) {
    return this.countryScreenerService.getRankings(
      query,
    );
  }

  @Public()
  @Post('export')
  @ApiOperation({
    summary: 'Export CSV',
    description: 'Fichier téléchargé avec succès',
  })
  @ApiResponse({
    status: 200,
    description: 'Fichier télécharger avec succès',
  })
  async exportCsv(
    @Query() query: CreateCountryScreenerDto,
    @Res() response: Response,
  ) {
    const result =
      await this.countryScreenerService.findCountries({
        ...query,
        page: 1,
        limit: 1000,
      });

    const headers = [
      'rank',
      'countryCode',
      'countryName',
      'region',
      'incomeLevel',
      'growth',
      'inflation',
      'overallScore',
      'outlook',
      'trend',
    ];

    const rows = result.data.map((item) =>
      headers
        .map((header) =>
          this.escapeCsv(
            item[header as keyof typeof item],
          ),
        )
        .join(','),
    );

    const csv = [
      headers.join(','),
      ...rows,
    ].join('\n');

    response.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8',
    );

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="country-screener.csv"',
    );

    response.send(csv);
  }

  private escapeCsv(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    const text = String(value);

    if (
      text.includes(',') ||
      text.includes('"') ||
      text.includes('\n')
    ) {
      return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
  }
}
