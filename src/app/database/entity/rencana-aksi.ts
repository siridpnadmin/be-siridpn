import { BelongsTo, Column, DataType, DeletedAt, ForeignKey, IsUUID, Table } from 'sequelize-typescript'
import BaseSchema from './base'
import RidpnDocument from './ridpn-document'

export type RencanaAksiStatus =
  | 'terlaksana'
  | 'sedang'
  | 'belum'
  | 'tidakDiketahui'
  | 'belumDiisi'

@Table({ tableName: 'rencana_aksi', paranoid: true })
export default class RencanaAksi extends BaseSchema {
  @DeletedAt
  @Column
  deleted_at?: Date

  @IsUUID(4)
  @ForeignKey(() => RidpnDocument)
  @Column({ type: DataType.UUID, allowNull: false })
  ridpn_document_id: string

  @BelongsTo(() => RidpnDocument, 'ridpn_document_id')
  document: RidpnDocument

  @Column({ type: DataType.STRING('50'), allowNull: false })
  no_ra: string

  @Column({ type: DataType.STRING('100'), allowNull: false })
  komponen: string

  @Column({ type: DataType.TEXT, allowNull: false })
  kegiatan: string

  @Column({ type: DataType.STRING('255'), allowNull: false })
  lokasi: string

  @Column({ type: DataType.STRING('100'), allowNull: false })
  target: string

  @Column({ type: DataType.STRING('100'), allowNull: false })
  tahun: string

  @Column({ type: DataType.JSONB, allowNull: false, defaultValue: [] })
  pelaksana: string[]

  @Column({
    type: DataType.ENUM('terlaksana', 'sedang', 'belum', 'tidakDiketahui', 'belumDiisi'),
    allowNull: false,
    defaultValue: 'belumDiisi',
  })
  status: RencanaAksiStatus
}
