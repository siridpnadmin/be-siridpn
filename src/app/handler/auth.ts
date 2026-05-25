import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import UserManagementService from '../service/user-management'

const route = express.Router()
const service = new UserManagementService()

route.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const session = await service.login(req.getBody())
    res.cookie('token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expiresIn * 1000,
      path: '/',
    })
    const httpResponse = HttpResponse.get({ data: session })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/sign-in',
  asyncHandler(async (req: Request, res: Response) => {
    const session = await service.login(req.getBody())
    res.cookie('token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expiresIn * 1000,
      path: '/',
    })
    const httpResponse = HttpResponse.get({ data: session })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/verify-session',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await service.verifySession(req)
    const httpResponse = HttpResponse.get({ data: user })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/sign-out',
  asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('token', { path: '/' })
    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

export { route as AuthHandler }
