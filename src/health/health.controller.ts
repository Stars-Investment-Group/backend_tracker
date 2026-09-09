import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../sig/decorators/public.decorator';
import { DatabaseService } from '../database/database.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Sonde de santé de l\'API (Healthcheck)',
    description: 'Vérifie l\'état de fonctionnement du serveur et la connectivité à PostgreSQL.',
  })
  @ApiResponse({
    status: 200,
    description: 'API et base de données opérationnelles',
  })
  async check() {
    let dbStatus = 'healthy';
    let latencyMs = 0;

    const start = Date.now();
    try {
      await this.databaseService.$queryRaw`SELECT 1`;
      latencyMs = Date.now() - start;
    } catch {
      dbStatus = 'unreachable';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'healthy',
        database: {
          status: dbStatus,
          latencyMs,
        },
      },
      system: {
        heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
