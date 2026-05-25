import { Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import User from './user'

@Table({ tableName: 'roles', timestamps: false })
export default class Role extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(50), allowNull: false })
  code: string

  @Column({ type: DataType.STRING(100), allowNull: false })
  name: string

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  manageable: boolean

  @HasMany(() => User, 'role_code')
  users?: User[]
}
