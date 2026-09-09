import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './sig/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  // 1. Sécurisation des headers HTTP avec Helmet
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // 2. Filtre Global d'Exceptions standardisé
  app.useGlobalFilters(new AllExceptionsFilter());

  // 3. Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. Activation de CORS sécurisé
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 5. Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('Stars Investment Group - API Tracker')
    .setDescription(
      'Documentation officielle de l’API pour la gestion des portefeuilles, instruments, transactions, utilisateurs et audits.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  console.log(`🚀 Application démarrée sur le port ${port}`);
  console.log(`📚 Swagger disponible sur http://localhost:${port}/api`);
  console.log(`🩺 Healthcheck disponible sur http://localhost:${port}/health`);
}
void bootstrap();
