import { Module, NestModule,MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './sig/guards/auth.guard';
import { RequestIdMiddleware } from './sig/middlewares/request-id.middleware';
import { LoggerMiddleware } from './sig/middlewares/logger.middleware';
import { InstrumentModule } from './instrument/instrument.module';
import { RolesGuard } from './sig/guards/roles.guard';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [DatabaseModule, UsersModule, PortfolioModule, InstrumentModule, TransactionModule],
  controllers: [AppController],
  providers: [
    AppService,
    // Guards globaux
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, LoggerMiddleware)
      .forRoutes('*'); // Appliqué à toutes les routes
  }
}
