import { Column, DataType, DeletedAt, Table } from 'sequelize-typescript'
import BaseSchema from './base'

export type MonevPhaseStatus = 'aktif' | 'nonaktif'

@Table({ tableName: 'monev_phase', paranoid: true })
export default class MonevPhase extends BaseSchema {
  @DeletedAt
  @Column
  deleted_at?: Date

  @Column({ type: DataType.STRING('100'), allowNull: false })
  nama_fase: string

  @Column({ type: DataType.STRING('150'), allowNull: false })
  perpres: string

  @Column({ type: DataType.STRING('150'), allowNull: false, unique: true })
  url_slug: string

  @Column({ type: DataType.STRING('50'), allowNull: false, unique: true })
  kode_akses: string

  @Column({ type: DataType.STRING('20'), allowNull: false })
  periode: string

  @Column({ type: DataType.STRING('50'), allowNull: false, defaultValue: '0 OPD' })
  submisi: string

  @Column({ type: DataType.ENUM('aktif', 'nonaktif'), allowNull: false, defaultValue: 'aktif' })
  status: MonevPhaseStatus

  @Column({ type: DataType.DATEONLY, allowNull: false })
  tanggal_mulai: string

  @Column({ type: DataType.DATEONLY, allowNull: false })
  tanggal_selesai: string

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  jumlah_submisi: number

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  total_ra: number

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  perlu_review: number
}
