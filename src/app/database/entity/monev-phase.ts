import { Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'

@Table({ tableName: 'monev_phase', timestamps: false })
export default class MonevPhase extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING(36), allowNull: false })
  id: string

  @Column({ type: DataType.STRING(255), allowNull: false })
  nama_fase: string

  @Column({ type: DataType.TEXT, allowNull: false })
  perpres: string

  @Column({ type: DataType.STRING(255), allowNull: false })
  url_slug: string

  @Column({ type: DataType.STRING(100), allowNull: false })
  kode_akses: string

  @Column({ type: DataType.STRING(20), allowNull: false })
  periode: string

  @Column({ type: DataType.STRING(100), allowNull: false })
  submisi: string

  @Default('aktif')
  @Column({ type: DataType.ENUM('aktif', 'nonaktif'), allowNull: false })
  status: string

  @Column({ type: DataType.DATEONLY, allowNull: false })
  tanggal_mulai: string

  @Column({ type: DataType.DATEONLY, allowNull: false })
  tanggal_selesai: string

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  jumlah_submisi: number

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  total_ra: number

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  perlu_review: number

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  created_at: Date

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  updated_at: Date

  @Column({ type: DataType.DATE, allowNull: true })
  deleted_at?: Date
}
