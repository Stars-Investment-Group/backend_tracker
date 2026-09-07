import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { InstrumentModule } from './instrument/instrument.module';
import { TransactionModule } from './transaction/transaction.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './sig/guards/roles.guard';
import { RequestIdMiddleware } from './sig/middlewares/request-id.middleware';
import { LoggerMiddleware } from './sig/middlewares/logger.middleware';
import { UemoaModule } from './uemoa/uemoa.module';
import { PortfolioPositionsModule } from './portfolio_positions/portfolio_positions.module';
import { PriceHistoryModule } from './price_history/price_history.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    AuthModule,
    UsersModule,
    PortfolioModule,
    InstrumentModule,
    TransactionModule,
    PortfolioPositionsModule,
    PriceHistoryModule,
    UemoaModule,
    NewsModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'auth',
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 1. Guard Global d'authentification JWT (@Public pour exclure)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2. Guard Global de contrôle d'accès RBAC (@Roles)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // 3. Guard Global Throttler (Rate Limiting)
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}