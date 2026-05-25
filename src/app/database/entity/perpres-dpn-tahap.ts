import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import Dpn from './dpn'
import Perpres from './perpres'
import Kegiatan from './kegiatan'

@Table({ tableName: 'perpres_dpn_tahap', timestamps: false })
export default class PerpresDpnTahap extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false })
  perpres_dpn_tahap_id: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  perpres_id: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  dpn_id: number

  @Column({ type: DataType.STRING, allowNull: false })
  tahap: string

  @Column({ type: DataType.DATEONLY, allowNull: true })
  tanggal_penetapan?: string

  @Column({ type: DataType.ENUM('draft', 'terpublikasi'), allowNull: true })
  status?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  catatan?: string

  @BelongsTo(() => Dpn, 'dpn_id')
  dpn?: Dpn

  @BelongsTo(() => Perpres, 'perpres_id')
  perpres?: Perpres

  @HasMany(() => Kegiatan, 'perpres_dpn_tahap_id')
  kegiatan?: Kegiatan[]
}
