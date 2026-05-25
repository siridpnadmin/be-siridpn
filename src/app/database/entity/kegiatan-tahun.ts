import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import Kegiatan from './kegiatan'
import Tahun from './tahun'

@Table({ tableName: 'kegiatan_tahun', timestamps: false })
export default class KegiatanTahun extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  kegiatan_id: number

  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  tahun_id: number

  @Column({ type: DataType.TEXT, allowNull: true })
  catatan?: string

  @BelongsTo(() => Kegiatan, 'kegiatan_id')
  kegiatan?: Kegiatan

  @BelongsTo(() => Tahun, 'tahun_id')
  tahun?: Tahun
}
