import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import KegiatanPelaksana from './kegiatan-pelaksana'

@Table({ tableName: 'laporan_monev', timestamps: false })
export default class LaporanMonev extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  laporan_monev_id: number

  @Column({ type: DataType.DATE, allowNull: false })
  created_at: Date

  @Column({ type: DataType.DATE, allowNull: true })
  updated_at?: Date

  @Column({ type: DataType.BIGINT, allowNull: false })
  kegiatan_pelaksana_id: number

  @Column({ type: DataType.ENUM('sedang dilaksanakan', 'terlaksana', 'belum terlaksana', 'tidak diketahui', 'belum dikonfirmasi'), allowNull: false })
  status_kegiatan: string

  @Column({ type: DataType.TEXT, allowNull: true })
  konfirmasi_satker?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  uraian_keterangan?: string

  @Column({ type: DataType.DOUBLE, allowNull: true })
  pagu_anggaran?: number

  @Column({ type: DataType.DOUBLE, allowNull: true })
  realisasi_anggaran?: number

  @Column({ type: DataType.TEXT, allowNull: true })
  kendala?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  tindak_lanjut?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  link_bukti?: string

  @Column({ type: DataType.STRING(20), allowNull: true })
  bukti_tipe?: string

  @Column({ type: DataType.DOUBLE, allowNull: true })
  progress_semester_1?: number

  @Column({ type: DataType.DOUBLE, allowNull: true })
  progress_semester_2?: number

  @Column({ type: DataType.TEXT, allowNull: true })
  indikator?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  output?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  outcome?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  nama_pejabat_penanggung_jawab?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  jabatan_penanggung_jawab?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  nama_operator?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  nomor_email_kontak?: string

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  perlu_review: boolean

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  aktif: boolean

  @Column({ type: DataType.TEXT, allowNull: true })
  diubah_oleh?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  diubah_oleh_email?: string

  @BelongsTo(() => KegiatanPelaksana, 'kegiatan_pelaksana_id')
  kegiatanPelaksana?: KegiatanPelaksana
}
