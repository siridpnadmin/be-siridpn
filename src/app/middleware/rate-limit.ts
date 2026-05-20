import { NextFunction, Request, RequestHandler, Response } from 'express'
import rateLimit, { Options, RateLimitRequestHandler } from 'express-rate-limit'
import { env } from '~/config/env'

export default function expressRateLimit(): RateLimitRequestHandler | RequestHandler {
  if (!env.RATE_LIMIT_ENABLED) {
    return (_req: Request, _res: Response, next: NextFunction) => next()
  }

  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    handler: (_req: Request, res: Response, _next: NextFunction, options: Options) => {
      const result = {
        statusCode: options.statusCode,
        error: 'Too Many Requests',
        message: options.message,
      }

      res.status(options.statusCode).json(result)
    },
  })
}
