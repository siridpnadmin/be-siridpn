import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Kegiatan from './kegiatan'

@Table({ tableName: 'kegiatan_tahun', timestamps: false })
export default class KegiatanTahun extends Model {
  @PrimaryKey
  @ForeignKey(() => Kegiatan)
  @Column({ type: DataType.TEXT, allowNull: false })
  kegiatan_id: string

  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  tahun_id: string

  @BelongsTo(() => Kegiatan, 'kegiatan_id')
  kegiatan?: Kegiatan

  @Column({ type: DataType.TEXT, allowNull: true })
  catatan?: string
}
