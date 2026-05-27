import Hashing from '~/config/hashing'
import { Request } from 'express'
import { Op } from 'sequelize'
import ErrorResponse from '~/lib/http/errors'
import { useQuery } from '~/lib/query-builder'
import JwtToken from '~/lib/token/jwt'
import { env } from '~/config/env'
import Role from '../database/entity/role'
import User from '../database/entity/user'
import UserDpnAccess from '../database/entity/user-dpn-access'
import Dpn from '../database/entity/dpn'
import type { QueryFilters, QuerySorts } from '~/lib/query-builder/types'

type FindParams = {
  page?: string | number
  pageSize?: string | number
  filtered?: QueryFilters[]
  sorted?: QuerySorts[]
}

type UserPayload = {
  name?: string
  email?: string
  password?: string
  role_code?: string
  dpn_ids?: Array<number | string>
}

type LoginPayload = {
  identifier?: string
  email?: string
  password?: string
}

const manageableRoleCodes = ['super_admin', 'manager_admin', 'local_admin', 'executive']
const usernamePattern = /^[a-z0-9._-]+$/

function normalizeUsername(value?: string) {
  return String(value || '').trim().toLowerCase()
}

export default class UserManagementService {
  private hashing = new Hashing()
  private jwt = new JwtToken({ secret: env.JWT_SECRET, expires: env.JWT_EXPIRES })

  async roles() {
    return Role.findAll({
      where: { manageable: true },
      order: [['name', 'asc']],
    })
  }

  private assertManageableRole(roleCode?: string) {
    if (!roleCode || !manageableRoleCodes.includes(roleCode)) {
      throw new ErrorResponse.BadRequest('role is not allowed for user management')
    }
  }

  private sanitizeUser(user: User) {
    const plain = user.get({ plain: true }) as Record<string, unknown>
    delete plain.password
    return plain
  }

  private normalizeDpnIds(dpnIds?: Array<number | string>) {
    return [...new Set((dpnIds ?? []).map((id) => Number(id)).filter(Number.isFinite))]
  }

  private assertDpnAccessPayload(roleCode?: string, dpnIds?: Array<number | string>) {
    const normalizedDpnIds = this.normalizeDpnIds(dpnIds)
    if (roleCode === 'local_admin' && normalizedDpnIds.length === 0) {
      throw new ErrorResponse.BadRequest('local admin must have at least one DPN access')
    }

    return normalizedDpnIds
  }

  private assertUsername(name?: string) {
    const username = normalizeUsername(name)

    if (!username) {
      throw new ErrorResponse.BadRequest('username is required')
    }

    if (!usernamePattern.test(username)) {
      throw new ErrorResponse.BadRequest(
        'username can only use lowercase letters, numbers, dots, underscores, and hyphens'
      )
    }

    return username
  }

  private async assertUniqueUserIdentity(username: string, email?: string, excludeId?: string) {
    const conditions: Array<{ name: string } | { email: string }> = [{ name: username }]
    if (email) {
      conditions.push({ email })
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: conditions,
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
    })

    if (!existingUser) return

    if (existingUser.name === username) {
      throw new ErrorResponse.BadRequest('username already exists')
    }

    throw new ErrorResponse.BadRequest('email already exists')
  }

  private async syncDpnAccess(userId: string, roleCode: string, dpnIds?: Array<number | string>) {
    await UserDpnAccess.destroy({ where: { user_id: userId } })

    const normalizedDpnIds = this.assertDpnAccessPayload(roleCode, dpnIds)
    if (roleCode !== 'local_admin' || normalizedDpnIds.length === 0) {
      return
    }

    await UserDpnAccess.bulkCreate(
      normalizedDpnIds.map((dpn_id) => ({
        user_id: userId,
        dpn_id,
      }))
    )
  }

  async find({ page, pageSize, filtered = [], sorted = [] }: FindParams) {
    const query = useQuery({
      model: User,
      reqQuery: { page, pageSize, filtered, sorted },
      includeRule: [{ model: Role }, { model: UserDpnAccess, include: [Dpn] }],
    })

    const data = await User.findAll({
      ...query,
      order: Array.isArray(query.order) && query.order.length ? query.order : [['created_at', 'desc']],
    })

    const total = await User.count({
      where: query.where,
      include: query.includeCount,
      distinct: true,
    })

    return { data: data.map((user) => this.sanitizeUser(user)), total }
  }

  async findById(id: string) {
    const user = await User.findByPk(id, { include: [Role, { model: UserDpnAccess, include: [Dpn] }] })

    if (!user) {
      throw new ErrorResponse.NotFound('user not found')
    }

    return this.sanitizeUser(user)
  }

  async create(payload: UserPayload) {
    this.assertManageableRole(payload.role_code)
    this.assertDpnAccessPayload(payload.role_code, payload.dpn_ids)

    if (!payload.name || !payload.email || !payload.password) {
      throw new ErrorResponse.BadRequest('username, email, and password are required')
    }
    const roleCode = payload.role_code as string
    const username = this.assertUsername(payload.name)

    await this.assertUniqueUserIdentity(username, payload.email)

    const user = await User.create({
      name: username,
      email: payload.email,
      password: await this.hashing.hash(payload.password),
      role_code: roleCode,
    })

    await this.syncDpnAccess(user.id, roleCode, payload.dpn_ids)

    return this.findById(user.id)
  }

  async update(id: string, payload: UserPayload) {
    const user = await User.findByPk(id)

    if (!user) {
      throw new ErrorResponse.NotFound('user not found')
    }

    if (payload.role_code) {
      this.assertManageableRole(payload.role_code)
    }

    const nextUsername = payload.name ? this.assertUsername(payload.name) : user.name
    await this.assertUniqueUserIdentity(nextUsername, payload.email, user.id)

    const nextRoleCode = payload.role_code ?? user.role_code
    this.assertDpnAccessPayload(nextRoleCode, payload.dpn_ids)

    await user.update({
      name: nextUsername,
      email: payload.email ?? user.email,
      password: payload.password ? await this.hashing.hash(payload.password) : user.password,
      role_code: nextRoleCode,
    })

    if (payload.role_code || payload.dpn_ids) {
      await this.syncDpnAccess(user.id, nextRoleCode, payload.dpn_ids)
    }

    return this.findById(user.id)
  }

  async delete(id: string) {
    const deleted = await User.destroy({ where: { id } })

    if (!deleted) {
      throw new ErrorResponse.NotFound('user not found')
    }
  }

  async login(payload: LoginPayload) {
    const identifier = String(payload.identifier || payload.email || '').trim().toLowerCase()

    if (!identifier || !payload.password) {
      throw new ErrorResponse.BadRequest('email/username and password are required')
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { name: identifier }],
      },
      include: [Role],
    })

    if (!user || !(await this.hashing.verify(user.password, payload.password))) {
      throw new ErrorResponse.Unauthorized('invalid email/username or password')
    }

    const userData = this.sanitizeUser(user)
    const token = this.jwt.generate({
      uid: user.id,
      email: user.email,
      role: user.role_code,
    })

    return { user: userData, ...token }
  }

  async verifySession(req: Request) {
    const token = this.jwt.extract(req)

    if (!token) {
      throw new ErrorResponse.Unauthorized('token not found')
    }

    const verified = this.jwt.verify(token)
    const payload = verified.data as { uid?: string } | null

    if (!payload?.uid) {
      throw new ErrorResponse.Unauthorized(verified.message)
    }

    return this.findById(payload.uid)
  }
}
