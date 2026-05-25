import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import JenisPelaksana from './jenis-pelaksana'
import KegiatanPelaksana from './kegiatan-pelaksana'

@Table({ tableName: 'pelaksana', timestamps: false })
export default class Pelaksana extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  pelaksana_id: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  jenis_pelaksana_id: number

  @Column({ type: DataType.STRING, allowNull: false })
  nama_pelaksana: string

  @Column({ type: DataType.TEXT, allowNull: true })
  catatan?: string

  @BelongsTo(() => JenisPelaksana, 'jenis_pelaksana_id')
  jenisPelaksana?: JenisPelaksana

  @HasMany(() => KegiatanPelaksana, 'pelaksana_id')
  kegiatanPelaksana?: KegiatanPelaksana[]
}
