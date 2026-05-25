import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import NotificationService from '../service/notification'

const route = express.Router()
const service = new NotificationService()

route.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await service.getCurrentUser(req)
    const { page, pageSize, unreadOnly } = req.getQuery()
    const records = await service.findForUser(user, { page, pageSize, unreadOnly: unreadOnly as string | undefined })
    const httpResponse = HttpResponse.get({ data: records })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/unread-count',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await service.getCurrentUser(req)
    const count = await service.unreadCountForUser(user)
    const httpResponse = HttpResponse.get({ data: { count } })
    res.status(200).json(httpResponse)
  })
)

route.put(
  '/read-all',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await service.getCurrentUser(req)
    const result = await service.markAllAsRead(user)
    const httpResponse = HttpResponse.updated({ data: result })
    res.status(200).json(httpResponse)
  })
)

route.put(
  '/:id/read',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await service.getCurrentUser(req)
    const { id } = req.getParams()
    const record = await service.markAsRead(user, id)
    const httpResponse = HttpResponse.updated({ data: record })
    res.status(200).json(httpResponse)
  })
)

export { route as NotificationHandler }
