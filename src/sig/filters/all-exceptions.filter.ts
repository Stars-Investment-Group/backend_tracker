import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Une erreur interne est survenue sur le serveur.';
    let errorType = 'Internal Server Error';

    const requestId =
      (request.headers['x-request-id'] as string) ||
      (response.getHeader('x-request-id') as string) ||
      'unknown';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, any>;
        message = resObj.message || exception.message;
        errorType = resObj.error || exception.name;
      } else {
        message = exceptionResponse;
        errorType = exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Mapping des codes d'erreur Prisma courants
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          const target = (exception.meta?.target as string[])?.join(', ') || 'champ unique';
          message = `Un enregistrement avec cette valeur existe déjà (${target}).`;
          errorType = 'Conflict';
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          message = 'L\'enregistrement demandé est introuvable.';
          errorType = 'Not Found';
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          message = 'Violation de contrainte d\'intégrité référentielle.';
          errorType = 'Foreign Key Constraint Violation';
          break;
        }
        default: {
          status = HttpStatus.BAD_REQUEST;
          message = 'Erreur liée à la base de données.';
          errorType = 'Database Error';
          break;
        }
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Format de requête de base de données invalide.';
      errorType = 'Validation Error';
    } else if (exception instanceof Error) {
      this.logger.error(
        `[RequestID: ${requestId}] [${request.method} ${request.url}] Erreur non gérée: ${exception.message}`,
        exception.stack,
      );
    }

    const errorResponse = {
      statusCode: status,
      message,
      error: errorType,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    };

    response.status(status).json(errorResponse);
  }
}
