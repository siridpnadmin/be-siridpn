import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import Komponen from './komponen'
import PerpresDpnTahap from './perpres-dpn-tahap'
import KegiatanPelaksana from './kegiatan-pelaksana'
import KegiatanTahun from './kegiatan-tahun'

@Table({ tableName: 'kegiatan', timestamps: false })
export default class Kegiatan extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  kegiatan_id: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  komponen_id: number

  @Column({ type: DataType.STRING, allowNull: false })
  no: string

  @Column({ type: DataType.TEXT, allowNull: false })
  deskripsi_kegiatan: string

  @Column({ type: DataType.STRING, allowNull: false })
  target: string

  @Column({ type: DataType.ENUM('sedang dilaksanakan', 'terlaksana', 'belum terlaksana', 'tidak diketahui', 'belum dikonfirmasi'), allowNull: false })
  status: string

  @Column({ type: DataType.STRING, allowNull: false })
  lokasi: string

  @Column({ type: DataType.INTEGER, allowNull: false })
  perpres_dpn_tahap_id: number

  @BelongsTo(() => Komponen, 'komponen_id')
  komponen?: Komponen

  @BelongsTo(() => PerpresDpnTahap, 'perpres_dpn_tahap_id')
  perpresDpnTahap?: PerpresDpnTahap

  @HasMany(() => KegiatanPelaksana, 'kegiatan_id')
  kegiatanPelaksana?: KegiatanPelaksana[]

  @HasMany(() => KegiatanTahun, 'kegiatan_id')
  kegiatanTahun?: KegiatanTahun[]
}
