import { green } from 'colorette'
import { ErrorRequestHandler } from 'express'
import { z } from 'zod'
import { logger } from '~/config/logger'

const expressErrorValidation: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof z.ZodError) {
    const msgType = green('zod')
    const message = 'validation error!'

    logger.error(`${msgType} - ${message}`)

    const errors =
      err.issues.length > 0
        ? err.issues.reduce((acc: Record<string, string>, curVal) => {
            acc[curVal.path.join('.')] = curVal.message || curVal.code
            return acc
          }, {})
        : {}

    res.status(422).json({
      statusCode: 422,
      error: 'Unprocessable Content',
      message,
      errors,
    })
    return
  }

  next(err)
}

export default expressErrorValidation
