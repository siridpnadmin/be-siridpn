import { Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import PerpresDpnTahap from './perpres-dpn-tahap'

@Table({ tableName: 'perpres', timestamps: false })
export default class Perpres extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  perpres_id: string

  @Column({ type: DataType.TEXT, allowNull: true })
  no_perpres?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  status?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  link?: string

  @HasMany(() => PerpresDpnTahap, 'perpres_id')
  perpresDpnTahap: PerpresDpnTahap[]
}
