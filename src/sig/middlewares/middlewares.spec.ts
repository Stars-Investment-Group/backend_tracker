jest.mock('uuid', () => ({
  v4: () => 'mocked-uuid-v4',
}));

import { RequestIdMiddleware } from './request-id.middleware';
import { LoggerMiddleware } from './logger.middleware';

describe('Middlewares', () => {
  describe('RequestIdMiddleware', () => {
    let middleware: RequestIdMiddleware;

    beforeEach(() => {
      middleware = new RequestIdMiddleware();
    });

    it('should generate a new request id if none present in headers', () => {
      const req: any = { headers: {} };
      const res: any = { setHeader: jest.fn() };
      const next = jest.fn();

      middleware.use(req, res, next);

      expect(req.headers['x-request-id']).toBe('mocked-uuid-v4');
      expect(req.requestId).toBe('mocked-uuid-v4');
      expect(res.setHeader).toHaveBeenCalledWith(
        'X-Request-Id',
        'mocked-uuid-v4',
      );
      expect(next).toHaveBeenCalled();
    });

    it('should reuse existing request id from headers', () => {
      const req: any = { headers: { 'x-request-id': 'existing-req-id-123' } };
      const res: any = { setHeader: jest.fn() };
      const next = jest.fn();

      middleware.use(req, res, next);

      expect(req.requestId).toBe('existing-req-id-123');
      expect(res.setHeader).toHaveBeenCalledWith(
        'X-Request-Id',
        'existing-req-id-123',
      );
      expect(next).toHaveBeenCalled();
    });
  });

  describe('LoggerMiddleware', () => {
    let middleware: LoggerMiddleware;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      middleware = new LoggerMiddleware();
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log request start and finish', () => {
      const req: any = {
        method: 'GET',
        originalUrl: '/api/v1/test',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
      };
      const finishCallbacks: Array<() => void> = [];
      const res: any = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'finish') finishCallbacks.push(callback);
        }),
      };
      const next = jest.fn();

      middleware.use(req, res, next);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/v1/test - 127.0.0.1 - Mozilla/5.0'),
      );
      expect(next).toHaveBeenCalled();

      // Trigger finish
      finishCallbacks.forEach((cb) => cb());
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /api/v1/test - 200'),
      );
    });
  });
});
