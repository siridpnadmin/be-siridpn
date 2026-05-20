import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import KegiatanPelaksana from './kegiatan-pelaksana'
import KegiatanTahun from './kegiatan-tahun'
import Komponen from './komponen'
import PerpresDpnTahap from './perpres-dpn-tahap'

@Table({ tableName: 'kegiatan', timestamps: false })
export default class Kegiatan extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  kegiatan_id: string

  @ForeignKey(() => Komponen)
  @Column({ type: DataType.TEXT, allowNull: true })
  komponen_id?: string

  @BelongsTo(() => Komponen, 'komponen_id')
  komponen?: Komponen

  @Column({ type: DataType.TEXT, allowNull: true })
  no?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  deskripsi_kegiatan?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  target?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  status?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  lokasi?: string

  @ForeignKey(() => PerpresDpnTahap)
  @Column({ type: DataType.TEXT, allowNull: true })
  perpres_dpn_tahap_id?: string

  @BelongsTo(() => PerpresDpnTahap, 'perpres_dpn_tahap_id')
  perpresDpnTahap?: PerpresDpnTahap

  @HasMany(() => KegiatanPelaksana, 'kegiatan_id')
  kegiatanPelaksana: KegiatanPelaksana[]

  @HasMany(() => KegiatanTahun, 'kegiatan_id')
  kegiatanTahun: KegiatanTahun[]
}
