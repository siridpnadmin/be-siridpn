import { BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import User from './user'

@Table({ tableName: 'notifications', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export default class Notification extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, allowNull: false })
  id: string

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  recipient_user_id?: string | null

  @Column({ type: DataType.STRING(50), allowNull: true })
  recipient_role_code?: string | null

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  actor_user_id?: string | null

  @Column({ type: DataType.STRING(50), allowNull: false, defaultValue: 'info' })
  type: string

  @Column({ type: DataType.STRING(100), allowNull: false, defaultValue: 'general' })
  category: string

  @Column({ type: DataType.STRING(180), allowNull: false })
  title: string

  @Column({ type: DataType.TEXT, allowNull: false })
  message: string

  @Column({ type: DataType.TEXT, allowNull: true })
  link?: string | null

  @Column({ type: DataType.JSON, allowNull: true })
  metadata?: Record<string, unknown> | null

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  is_read: boolean

  @Column({ type: DataType.DATE, allowNull: true })
  read_at?: Date | null

  @BelongsTo(() => User, 'recipient_user_id')
  recipient?: User

  @BelongsTo(() => User, 'actor_user_id')
  actor?: User
}
