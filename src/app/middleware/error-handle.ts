import { ErrorRequestHandler } from 'express'
import _ from 'lodash'
import multer from 'multer'
import ErrorResponse from '~/lib/http/errors'

interface DtoErrorResponse {
  statusCode: number
  error: string
  message: string
}

function generateErrorResponse(err: Error, statusCode: number): DtoErrorResponse {
  return _.isObject(err.message)
    ? (err.message as any)
    : {
        statusCode,
        error: err.name,
        message: err.message,
      }
}

const expressErrorHandle: ErrorRequestHandler = (err, _req, res, next) => {
  // multer error
  if (err instanceof multer.MulterError) {
    res.status(400).json(generateErrorResponse(err, 400))
    return
  }

  // custom global error
  if (err instanceof ErrorResponse.BaseResponse) {
    res.status(err.statusCode).json(generateErrorResponse(err, err.statusCode))
    return
  }

  next(err)
}

export default expressErrorHandle
