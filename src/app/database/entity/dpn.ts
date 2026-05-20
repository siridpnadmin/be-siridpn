import { Column, DataType, DeletedAt, HasMany, Table } from 'sequelize-typescript'
import BaseSchema from './base'
import RidpnDocument from './ridpn-document'

@Table({ tableName: 'dpn', paranoid: true })
export default class Dpn extends BaseSchema {
  @DeletedAt
  @Column
  deleted_at?: Date

  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  dpn_id: number

  @Column({ type: DataType.STRING('50'), allowNull: false, unique: true })
  kode: string

  @Column({ type: DataType.STRING('255'), allowNull: false })
  nama_dpn: string

  @Column({ type: DataType.DOUBLE, allowNull: true })
  lat_pusat?: number

  @Column({ type: DataType.DOUBLE, allowNull: true })
  long_pusat?: number

  @Column({ type: DataType.TEXT, allowNull: true })
  public_thumbnail?: string

  @HasMany(() => RidpnDocument, 'dpn_id')
  documents: RidpnDocument[]
}
