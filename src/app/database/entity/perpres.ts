import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript'
import PerpresDpnTahap from './perpres-dpn-tahap'

@Table({ tableName: 'perpres', timestamps: false })
export default class Perpres extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  perpres_id: number

  @Column({ type: DataType.STRING, allowNull: false })
  no_perpres: string

  @Column({ type: DataType.ENUM('draft', 'terpublikasi', 'dicabut'), allowNull: false })
  status: string

  @Column({ type: DataType.TEXT, allowNull: true })
  link?: string

  @HasMany(() => PerpresDpnTahap, 'perpres_id')
  perpresDpnTahap?: PerpresDpnTahap[]
}
