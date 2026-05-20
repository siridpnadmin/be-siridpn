import { BelongsTo, Column, DataType, ForeignKey, IsUUID, Table } from 'sequelize-typescript'
import BaseSchema from './base'
import User from './user'

@Table({ tableName: 'user_dpn_access' })
export default class UserDpnAccess extends BaseSchema {
  @IsUUID(4)
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string

  @BelongsTo(() => User)
  user: User

  @Column({ type: DataType.STRING('50'), allowNull: false })
  dpn_code: string
}
