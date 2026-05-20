import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import JenisPelaksana from './jenis-pelaksana'
import KegiatanPelaksana from './kegiatan-pelaksana'

@Table({ tableName: 'pelaksana', timestamps: false })
export default class Pelaksana extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  pelaksana_id: string

  @ForeignKey(() => JenisPelaksana)
  @Column({ type: DataType.TEXT, allowNull: true })
  jenis_pelaksana_id?: string

  @BelongsTo(() => JenisPelaksana, 'jenis_pelaksana_id')
  jenisPelaksana?: JenisPelaksana

  @Column({ type: DataType.TEXT, allowNull: true })
  nama_pelaksana?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  catatan?: string

  @HasMany(() => KegiatanPelaksana, 'pelaksana_id')
  kegiatanPelaksana: KegiatanPelaksana[]
}
