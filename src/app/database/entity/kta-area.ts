import { BelongsTo, Column, DataType, DeletedAt, ForeignKey, IsUUID, Table } from 'sequelize-typescript'
import BaseSchema from './base'
import Dpn from './dpn'

@Table({ tableName: 'kta_area', paranoid: true })
export default class KtaArea extends BaseSchema {
  @DeletedAt
  @Column
  deleted_at?: Date

  @IsUUID(4)
  @ForeignKey(() => Dpn)
  @Column({ type: DataType.UUID, allowNull: false })
  dpn_id: string

  @BelongsTo(() => Dpn, 'dpn_id')
  dpn: Dpn

  @Column({ type: DataType.STRING('150'), allowNull: false })
  nama_kta: string

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  kabupaten_kota: string[]

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  nomor_urut: number
}
