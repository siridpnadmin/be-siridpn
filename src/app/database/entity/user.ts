import { BeforeValidate, BelongsTo, Column, DataType, Default, ForeignKey, HasMany, IsEmail, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Role from './role'
import UserDpnAccess from './user-dpn-access'

@Table({ tableName: 'users', underscored: true, paranoid: true })
export default class User extends Model {
  @BeforeValidate
  static normalizeUsername(instance: User) {
    if (instance.name) {
      instance.name = String(instance.name).trim().toLowerCase()
    }
  }

  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUID, allowNull: false })
  id: string

  @Column({ type: DataType.STRING(150), allowNull: false, unique: true })
  name: string

  @IsEmail
  @Column({ type: DataType.STRING(150), allowNull: false, unique: true })
  email: string

  @Column({ type: DataType.TEXT, allowNull: false })
  password: string

  @ForeignKey(() => Role)
  @Column({ type: DataType.STRING(50), allowNull: false })
  role_code: string

  @BelongsTo(() => Role, 'role_code')
  role?: Role

  @HasMany(() => UserDpnAccess, 'user_id')
  dpn_access?: UserDpnAccess[]
}
