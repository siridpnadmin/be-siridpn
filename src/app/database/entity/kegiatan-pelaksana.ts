import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import Kegiatan from './kegiatan'
import Pelaksana from './pelaksana'
import LaporanMonev from './laporan-monev'

@Table({ tableName: 'kegiatan_pelaksana', timestamps: false })
export default class KegiatanPelaksana extends Model {
  @Column({ type: DataType.BIGINT, allowNull: false })
  kegiatan_id: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  pelaksana_id: number

  @Column({ type: DataType.TEXT, allowNull: true })
  catatan?: string

  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  kegiatan_pelaksana_id: number

  @BelongsTo(() => Kegiatan, 'kegiatan_id')
  kegiatan?: Kegiatan

  @BelongsTo(() => Pelaksana, 'pelaksana_id')
  pelaksana?: Pelaksana

  @HasMany(() => LaporanMonev, 'kegiatan_pelaksana_id')
  laporanMonev?: LaporanMonev[]
}
