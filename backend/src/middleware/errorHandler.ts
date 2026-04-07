import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn({
      err,
      requestId: req.requestId,
      statusCode: err.statusCode,
      code: err.code,
    }, `AppError: ${err.message}`);

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...('details' in err ? { details: (err as Record<string, unknown>).details } : {}),
      },
    });
    return;
  }

  logger.error({
    err,
    requestId: req.requestId,
    stack: err.stack,
  }, 'Unhandled error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}
