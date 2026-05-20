import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Kegiatan from './kegiatan'
import Perpres from './perpres'

@Table({ tableName: 'perpres_dpn_tahap', timestamps: false })
export default class PerpresDpnTahap extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  perpres_dpn_tahap_id: string

  @ForeignKey(() => Perpres)
  @Column({ type: DataType.TEXT, allowNull: true })
  perpres_id?: string

  @BelongsTo(() => Perpres, 'perpres_id')
  perpres?: Perpres

  @Column({ type: DataType.TEXT, allowNull: true })
  dpn_id?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  tahap?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  tanggal_penetapan?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  status?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  catatan?: string

  @HasMany(() => Kegiatan, 'perpres_dpn_tahap_id')
  kegiatan: Kegiatan[]
}
