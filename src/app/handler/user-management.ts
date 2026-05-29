import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import type { QueryFilters, QuerySorts } from '~/lib/query-builder/types'
import UserManagementService from '../service/user-management'
import NotificationService from '../service/notification'

const route = express.Router()
const service = new UserManagementService()
const notificationService = new NotificationService()

function getNotificationUser(record: Record<string, unknown>) {
  return {
    id: typeof record.id === 'string' ? record.id : '',
    roleCode: typeof record.role_code === 'string' ? record.role_code : '',
  }
}

route.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const actor = await notificationService.getCurrentUser(req)
    service.assertActorCanAccessManagement(actor)
    const { page, pageSize, filtered, sorted } = req.getQuery()
    const records = await service.find(
      {
        page,
        pageSize,
        filtered: filtered as QueryFilters[] | undefined,
        sorted: sorted as QuerySorts[] | undefined,
      },
      actor
    )
    const httpResponse = HttpResponse.get({ data: records })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/roles',
  asyncHandler(async (req: Request, res: Response) => {
    const actor = await notificationService.getCurrentUser(req)
    service.assertActorCanAccessManagement(actor)
    const roles = await service.roles()
    const httpResponse = HttpResponse.get({ data: roles })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const actor = await notificationService.getCurrentUser(req)
    service.assertActorCanAccessManagement(actor)
    const { id } = req.getParams()
    const record = await service.findById(id, actor)
    const httpResponse = HttpResponse.get({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const actor = await notificationService.getCurrentUser(req)
    const record = await service.create(req.getBody(), actor)
    const notificationUser = getNotificationUser(record)
    if (notificationUser.id && notificationUser.id !== actor?.id) {
      await notificationService.create({
        recipient_user_id: notificationUser.id,
        actor_user_id: actor?.id ?? null,
        type: 'info',
        category: 'user-access',
        title: 'Akun pengguna dibuat',
        message: `Akun Anda telah dibuat dengan role ${notificationUser.roleCode}.`,
        link: '/admin/dashboard',
        metadata: {
          user_id: notificationUser.id,
          role_code: notificationUser.roleCode,
          action: 'created',
        },
      })
    }
    const httpResponse = HttpResponse.created({ data: record })
    res.status(201).json(httpResponse)
  })
)

route.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const actor = await notificationService.getCurrentUser(req)
    const record = await service.update(id, req.getBody(), actor)
    const notificationUser = getNotificationUser(record)
    if (notificationUser.id && notificationUser.id !== actor?.id) {
      await notificationService.create({
        recipient_user_id: notificationUser.id,
        actor_user_id: actor?.id ?? null,
        type: 'info',
        category: 'user-access',
        title: 'Akses akun diperbarui',
        message: `Akses akun Anda telah diperbarui. Role saat ini: ${notificationUser.roleCode}.`,
        link: '/admin/dashboard',
        metadata: {
          user_id: notificationUser.id,
          role_code: notificationUser.roleCode,
          action: 'updated',
        },
      })
    }
    const httpResponse = HttpResponse.updated({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const actor = await notificationService.getCurrentUser(req)
    await service.delete(id, actor)
    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

export { route as UserManagementHandler }
