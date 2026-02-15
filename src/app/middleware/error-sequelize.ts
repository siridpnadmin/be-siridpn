import { green } from 'colorette'
import { ErrorRequestHandler } from 'express'
import _ from 'lodash'
import { BaseError, EmptyResultError, ValidationError } from 'sequelize'
import { logger } from '~/config/logger'

const expressErrorSequelize: ErrorRequestHandler = (err, _req, res, next) => {
  if (err instanceof BaseError) {
    const msgType = green('sequelize')
    logger.error(`${msgType} - ${err.message ?? err}`)

    if (err instanceof EmptyResultError) {
      res.status(404).json({
        code: 404,
        error: 'Not Found',
        message: `${msgType} ${err.message}`,
      })
      return
    }

    if (err instanceof ValidationError) {
      const errors = _.get(err, 'errors', []) as ValidationError['errors']

      const errorMessage = _.get(errors, '0.message', null)

      res.status(400).json({
        code: 400,
        message: errorMessage ? `Validation error: ${errorMessage}` : err.message,
        errors: errors.reduce<Record<string, string>>((acc, curVal) => {
          if (curVal.path) {
            acc[curVal.path] = curVal.message
          }
          return acc
        }, {}),
      })
      return
    }

    res.status(500).json({
      code: 500,
      error: 'Internal Server Error',
      message: `${msgType} ${err.message}`,
    })
    return
  }

  next(err)
}

export default expressErrorSequelize
