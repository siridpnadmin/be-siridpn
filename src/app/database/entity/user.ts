import {
  BeforeCreate,
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  DeletedAt,
  ForeignKey,
  HasMany,
  IsUUID,
  Scopes,
  Table,
  Unique,
} from 'sequelize-typescript'
import Hashing from '~/config/hashing'
import { createPasswordSchema } from '../schema/user'
import BaseSchema from './base'
import Role from './role'
import Session from './session'
import Upload from './upload'
import UserDpnAccess from './user-dpn-access'

const hashing = new Hashing()

@DefaultScope(() => ({
  attributes: {
    exclude: ['password', 'token_verify'],
  },
}))
@Scopes(() => ({
  withPassword: {},
}))
@Table({ tableName: 'user', paranoid: true })
export default class User extends BaseSchema {
  @DeletedAt
  @Column
  deleted_at?: Date

  @Column({ allowNull: false })
  fullname: string

  @Unique
  @Column({ allowNull: false })
  email: string

  @Column({ allowNull: false })
  password?: string

  @Column({ type: DataType.STRING('20') })
  phone?: string

  @Column({ type: DataType.TEXT })
  token_verify?: string

  @Column({ type: DataType.TEXT })
  address?: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_active?: boolean

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_blocked?: boolean

  @IsUUID(4)
  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  role_id: string

  @BelongsTo(() => Role)
  role: Role

  @IsUUID(4)
  @ForeignKey(() => Upload)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  upload_id?: string

  @BelongsTo(() => Upload)
  upload?: Upload

  @HasMany(() => Session)
  sessions: Session[]

  @HasMany(() => UserDpnAccess)
  dpn_accesses: UserDpnAccess[]

  @Column({ type: DataType.VIRTUAL })
  new_password: string

  @Column({ type: DataType.VIRTUAL })
  confirm_new_password: string

  comparePassword: (current_password: string) => Promise<boolean>

  @BeforeUpdate
  @BeforeCreate
  static async setUserPassword(instance: User): Promise<void> {
    const { new_password, confirm_new_password } = instance

    if (new_password ?? confirm_new_password) {
      const formPassword = { new_password, confirm_new_password }
      const validPassword = createPasswordSchema.parse(formPassword)

      const hash = await hashing.hash(validPassword.new_password)
      instance.setDataValue('password', hash)
    }
  }
}

User.prototype.comparePassword = async function (current_password: string): Promise<boolean> {
  const password = String(this.password)

  const compare = await hashing.verify(password, current_password)
  return compare
}
