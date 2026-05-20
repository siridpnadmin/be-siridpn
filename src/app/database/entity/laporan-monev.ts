import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import KegiatanPelaksana from './kegiatan-pelaksana'

@Table({ tableName: 'laporan_monev', timestamps: false })
export default class LaporanMonev extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  laporan_monev_id: string

  @Column({ type: DataType.TEXT, allowNull: true })
  created_at?: string

  @ForeignKey(() => KegiatanPelaksana)
  @Column({ type: DataType.TEXT, allowNull: true })
  kegiatan_pelaksana_id?: string

  @BelongsTo(() => KegiatanPelaksana, 'kegiatan_pelaksana_id')
  kegiatanPelaksana?: KegiatanPelaksana

  @Column({ type: DataType.TEXT, allowNull: true })
  status_kegiatan?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  konfirmasi_satker?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  uraian_keterangan?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  pagu_anggaran?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  realisasi_anggaran?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  kendala?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  tindak_lanjut?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  link_bukti?: string
}
