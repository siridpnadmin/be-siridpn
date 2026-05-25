import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

@Table({
  tableName: 'management_report',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
export default class ManagementReport extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false, autoIncrement: true })
  id: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  dpn_id: number

  @Column({ type: DataType.TEXT, allowNull: false })
  dpn_nama: string

  @Column({ type: DataType.BIGINT, allowNull: true })
  pelaksana_id?: number

  @Column({ type: DataType.TEXT, allowNull: false })
  kelompok_kerja: string

  @Column({ type: DataType.TEXT, allowNull: false })
  nama_file: string

  @Column({ type: DataType.INTEGER, allowNull: false })
  tahap: number

  @Column({ type: DataType.INTEGER, allowNull: true })
  tahun?: number

  @Column({ type: DataType.TEXT, allowNull: true })
  keterangan?: string

  @Column({ type: DataType.TEXT, allowNull: false })
  link_file: string

  @Column({ type: DataType.TEXT, allowNull: false })
  file_name: string

  @Column({ type: DataType.TEXT, allowNull: true })
  file_key?: string

  @Column({ type: DataType.BIGINT, allowNull: true })
  file_size?: number

  @Column({ type: DataType.TEXT, allowNull: true })
  mime_type?: string
}
