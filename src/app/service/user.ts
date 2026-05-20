import { Includeable, Model, ModelStatic } from 'sequelize'
import { db } from '../database/connection'
import ErrorResponse from '~/lib/http/errors'
import { useQuery } from '~/lib/query-builder'
import { validate } from '~/lib/validate'
import Role from '../database/entity/role'
import Session from '../database/entity/session'
import Upload from '../database/entity/upload'
import User from '../database/entity/user'
import UserDpnAccess from '../database/entity/user-dpn-access'
import {
  changePasswordSchema,
  ChangePasswordSchema,
  userSchema,
  userUpdateSchema,
} from '../database/schema/user'
import BaseService from './base'
import { DtoFindAll, FindParams } from './types'

// Define a type that ensures User is recognized as a Sequelize Model
type UserModel = User & Model
type RoleModel = Role & Model
type UploadModel = Upload & Model
type SessionModel = Session & Model
type UserDpnAccessModel = UserDpnAccess & Model

const relations: Includeable[] = [
  { model: Role as unknown as ModelStatic<RoleModel> },
  { model: Upload as unknown as ModelStatic<UploadModel> },
  { model: Session as unknown as ModelStatic<SessionModel> },
  { model: UserDpnAccess as unknown as ModelStatic<UserDpnAccessModel> },
]

export default class UserService extends BaseService<UserModel> {
  constructor() {
    super({
      repository: User as unknown as ModelStatic<UserModel>,
      schema: userSchema,
      model: 'user',
    })
  }

  /**
   * Find all with relations
   */
  async findWithRelations({
    page,
    pageSize,
    filtered = [],
    sorted = [],
  }: FindParams): Promise<DtoFindAll<UserModel>> {
    const query = useQuery({
      model: this.repository,
      reqQuery: { page, pageSize, filtered, sorted },
      includeRule: relations,
    })

    const data = await this.repository.findAll({
      ...query,
      order: query.order ? query.order : [['created_at', 'desc']],
    })

    const total = await this.repository.count({
      include: query.includeCount,
      where: query.where,
    })

    return { data, total }
  }

  /**
   * Find by id with relation
   */
  async findByIdWithRelation(id: string) {
    const newId = validate.uuid(id)
    const record = await this._findOne({
      where: { id: newId },
      include: relations,
      rejectOnEmpty: true,
    })

    return record
  }

  async create(data: UserModel): Promise<UserModel> {
    const values = userSchema.parse(data)
    const { dpn_accesses = [], ...userValues } = values

    let record: UserModel
    await db.sequelize!.transaction(async (transaction) => {
      record = await this.repository.create(userValues as any, { transaction })
      await this._syncDpnAccess(record.id, dpn_accesses, transaction)
    })

    return this.findByIdWithRelation(record!.id) as Promise<UserModel>
  }

  async update(id: string, data: UserModel): Promise<UserModel> {
    const record = await this.findById(id)
    const values = userUpdateSchema.parse({
      ...(record.toJSON() as Record<string, unknown>),
      ...(data as unknown as Record<string, unknown>),
    })
    const { dpn_accesses = [], ...userValues } = values

    await db.sequelize!.transaction(async (transaction) => {
      await record.update(userValues as any, { transaction })
      await this._syncDpnAccess(record.id, dpn_accesses, transaction)
    })

    return this.findByIdWithRelation(record.id) as Promise<UserModel>
  }

  /**
   * Check email
   */
  async checkEmail(email: string) {
    const record = await this.repository.findOne({ where: { email } })

    if (record) {
      throw new ErrorResponse.BadRequest('email already exists')
    }
  }

  private async _syncDpnAccess(userId: string, dpnAccesses: string[], transaction: any) {
    const normalizedDpnCodes = [...new Set(dpnAccesses.map((item) => item.trim()).filter(Boolean))]

    await UserDpnAccess.destroy({
      where: { user_id: userId },
      transaction,
    })

    if (normalizedDpnCodes.length === 0) return

    await UserDpnAccess.bulkCreate(
      normalizedDpnCodes.map((dpnCode) => ({
        user_id: userId,
        dpn_code: dpnCode,
      })),
      { transaction }
    )
  }

  /**
   * Change password
   */
  async changePassword(id: string, formData: ChangePasswordSchema) {
    const newId = validate.uuid(id)
    const values = changePasswordSchema.parse(formData)

    const record = await this.repository.findOne({
      attributes: ['id', 'email', 'password', 'is_active', 'role_id'],
      where: { id: newId },
    })

    if (!record) {
      throw new ErrorResponse.NotFound('user not found')
    }

    const isPasswordMatch = await record.comparePassword(values.current_password)
    if (!isPasswordMatch) {
      throw new ErrorResponse.BadRequest('current password is incorrect')
    }

    // update password
    await record.update({ password: values.new_password })
  }
}
