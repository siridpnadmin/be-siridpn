import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Dpn from './dpn'
import User from './user'

@Table({ tableName: 'user_dpn_access', underscored: true, timestamps: true })
export default class UserDpnAccess extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, allowNull: false, defaultValue: DataType.UUIDV4 })
  id: string

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string

  @ForeignKey(() => Dpn)
  @Column({ type: DataType.BIGINT, allowNull: false })
  dpn_id: number

  @BelongsTo(() => User, 'user_id')
  user?: User

  @BelongsTo(() => Dpn, 'dpn_id')
  dpn?: Dpn
}
