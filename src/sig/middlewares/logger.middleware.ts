import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const timestamp = new Date().toISOString();
    const userAgent = req.get('user-agent') || 'unknown';

    const start = Date.now();

    console.log(`[${timestamp}] ${method} ${originalUrl} - ${ip} - ${userAgent}`);

    res.on('finish', () => {
      const duration = Date.now() - start;
      const endTimestamp = new Date().toISOString();
      console.log(`[${endTimestamp}] ${method} ${originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
  }
}