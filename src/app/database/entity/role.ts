import { Column, DeletedAt, HasMany, Table } from 'sequelize-typescript'
import BaseSchema from './base'
import User from './user'

@Table({ tableName: 'role', paranoid: true })
export default class Role extends BaseSchema {
  @DeletedAt
  @Column
  deleted_at?: Date

  @Column({ allowNull: false })
  name: string

  @HasMany(() => User)
  users: User[]
}
