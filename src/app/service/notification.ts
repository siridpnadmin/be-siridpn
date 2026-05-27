import { Request } from 'express'
import { Op } from 'sequelize'
import ErrorResponse from '~/lib/http/errors'
import Notification from '../database/entity/notification'
import User from '../database/entity/user'
import UserDpnAccess from '../database/entity/user-dpn-access'
import UserManagementService from './user-management'

export type CurrentUser = {
  id: string
  name?: string | null
  email?: string | null
  role_code?: string | null
  dpn_access?: Array<{
    dpn_id: string | number
  }>
}

type FindParams = {
  page?: string | number
  pageSize?: string | number
  unreadOnly?: string | boolean
}

export type NotificationPayload = {
  recipient_user_id?: string | null
  recipient_role_code?: string | null
  actor_user_id?: string | null
  type?: string
  category?: string
  title: string
  message: string
  link?: string | null
  metadata?: Record<string, unknown> | null
}

export default class NotificationService {
  private userService = new UserManagementService()

  async getCurrentUser(req: Request): Promise<CurrentUser> {
    const user = (await this.userService.verifySession(req)) as CurrentUser

    if (!user.id) {
      throw new ErrorResponse.Unauthorized('invalid session')
    }

    return user
  }

  private recipientWhere(user: CurrentUser) {
    return {
      [Op.or]: [
        { recipient_user_id: user.id },
        ...(user.role_code ? [{ recipient_role_code: user.role_code }] : []),
      ],
    }
  }

  async create(payload: NotificationPayload) {
    if (!payload.recipient_user_id && !payload.recipient_role_code) {
      throw new ErrorResponse.BadRequest('notification recipient is required')
    }

    return Notification.create({
      recipient_user_id: payload.recipient_user_id ?? null,
      recipient_role_code: payload.recipient_role_code ?? null,
      actor_user_id: payload.actor_user_id ?? null,
      type: payload.type || 'info',
      category: payload.category || 'general',
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
      metadata: payload.metadata ?? null,
    })
  }

  async createForRoles(roleCodes: string[], payload: Omit<NotificationPayload, 'recipient_user_id' | 'recipient_role_code'>) {
    const uniqueRoleCodes = [...new Set(roleCodes.filter(Boolean))]

    if (!uniqueRoleCodes.length) return []

    return Notification.bulkCreate(
      uniqueRoleCodes.map((roleCode) => ({
        recipient_role_code: roleCode,
        actor_user_id: payload.actor_user_id ?? null,
        type: payload.type || 'info',
        category: payload.category || 'general',
        title: payload.title,
        message: payload.message,
        link: payload.link ?? null,
        metadata: payload.metadata ?? null,
      }))
    )
  }

  async createForUsers(userIds: string[], payload: Omit<NotificationPayload, 'recipient_user_id' | 'recipient_role_code'>) {
    const uniqueUserIds = [...new Set(userIds.filter(Boolean))].filter((userId) => userId !== payload.actor_user_id)

    if (!uniqueUserIds.length) return []

    return Notification.bulkCreate(
      uniqueUserIds.map((userId) => ({
        recipient_user_id: userId,
        actor_user_id: payload.actor_user_id ?? null,
        type: payload.type || 'info',
        category: payload.category || 'general',
        title: payload.title,
        message: payload.message,
        link: payload.link ?? null,
        metadata: payload.metadata ?? null,
      }))
    )
  }

  async createForRolesAndDpnLocalAdmins(
    roleCodes: string[],
    dpnId: string | number | null | undefined,
    payload: Omit<NotificationPayload, 'recipient_user_id' | 'recipient_role_code'>
  ) {
    const localAdminAccess = dpnId
      ? await UserDpnAccess.findAll({
          where: { dpn_id: Number(dpnId) },
          include: [
            {
              model: User,
              where: { role_code: 'local_admin' },
            },
          ],
        })
      : []

    const [roleNotifications, localAdminNotifications] = await Promise.all([
      this.createForRoles(roleCodes, payload),
      this.createForUsers(
        localAdminAccess.map((access) => access.user_id),
        payload
      ),
    ])

    return [...roleNotifications, ...localAdminNotifications]
  }

  async findForUser(user: CurrentUser, { page = 1, pageSize = 20, unreadOnly = false }: FindParams) {
    const limit = Math.min(Math.max(Number(pageSize) || 20, 1), 100)
    const currentPage = Math.max(Number(page) || 1, 1)
    const where = {
      ...this.recipientWhere(user),
      ...(unreadOnly === true || unreadOnly === 'true' ? { is_read: false } : {}),
    }

    const { rows, count } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'desc']],
      limit,
      offset: (currentPage - 1) * limit,
    })

    return {
      data: rows,
      total: count,
      page: currentPage,
      pageSize: limit,
    }
  }

  async unreadCountForUser(user: CurrentUser) {
    return Notification.count({
      where: {
        ...this.recipientWhere(user),
        is_read: false,
      },
    })
  }

  async markAsRead(user: CurrentUser, id: string) {
    const notification = await Notification.findOne({
      where: {
        id,
        ...this.recipientWhere(user),
      },
    })

    if (!notification) {
      throw new ErrorResponse.NotFound('notification not found')
    }

    if (!notification.is_read) {
      await notification.update({ is_read: true, read_at: new Date() })
    }

    return notification
  }

  async markAllAsRead(user: CurrentUser) {
    const [updated] = await Notification.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          ...this.recipientWhere(user),
          is_read: false,
        },
      }
    )

    return { updated }
  }
}
