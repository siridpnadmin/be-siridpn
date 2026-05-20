import { BelongsTo, Column, DataType, DeletedAt, ForeignKey, IsUUID, Table } from 'sequelize-typescript'
import BaseSchema from './base'
import Dpn from './dpn'

export type RidpnDocumentStatus = 'terbit' | 'rancangan'

@Table({ tableName: 'ridpn_document', paranoid: true })
export default class RidpnDocument extends BaseSchema {
  @DeletedAt
  @Column
  deleted_at?: Date

  @Column({ type: DataType.STRING('255'), allowNull: false })
  no_perpres: string

  @Column({ type: DataType.ENUM('terbit', 'rancangan'), allowNull: false, defaultValue: 'rancangan' })
  status: RidpnDocumentStatus

  @IsUUID(4)
  @ForeignKey(() => Dpn)
  @Column({ type: DataType.UUID, allowNull: false })
  dpn_id: string

  @BelongsTo(() => Dpn, 'dpn_id')
  dpn: Dpn

  @Column({ type: DataType.STRING('50'), allowNull: false })
  tahap: string

  @Column({ type: DataType.TEXT, allowNull: true })
  link?: string
}
