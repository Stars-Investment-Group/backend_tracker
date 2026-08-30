import { Module, ValidationPipe } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AuthGuard } from './sig/guards/auth.guard';
import { RequestIdMiddleware } from './sig/middlewares/request-id.middleware';
import { LoggerMiddleware } from './sig/middlewares/logger.middleware';
import { InstrumentModule } from './instrument/instrument.module';
import { RolesGuard } from './sig/guards/roles.guard';
import { TransactionModule } from './transaction/transaction.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PortfolioPositionsModule } from './portfolio_positions/portfolio_positions.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    PortfolioModule,
    InstrumentModule,
    TransactionModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'auth',
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    PortfolioPositionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Pipe global
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}