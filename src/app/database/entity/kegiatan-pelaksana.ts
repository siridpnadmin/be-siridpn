import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Kegiatan from './kegiatan'
import LaporanMonev from './laporan-monev'
import Pelaksana from './pelaksana'

@Table({ tableName: 'kegiatan_pelaksana', timestamps: false })
export default class KegiatanPelaksana extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  kegiatan_pelaksana_id: string

  @ForeignKey(() => Kegiatan)
  @Column({ type: DataType.TEXT, allowNull: true })
  kegiatan_id?: string

  @BelongsTo(() => Kegiatan, 'kegiatan_id')
  kegiatan?: Kegiatan

  @ForeignKey(() => Pelaksana)
  @Column({ type: DataType.TEXT, allowNull: true })
  pelaksana_id?: string

  @BelongsTo(() => Pelaksana, 'pelaksana_id')
  pelaksana?: Pelaksana

  @Column({ type: DataType.TEXT, allowNull: true })
  catatan?: string

  @HasMany(() => LaporanMonev, 'kegiatan_pelaksana_id')
  laporanMonev: LaporanMonev[]
}
