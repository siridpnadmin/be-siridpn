import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import Kegiatan from './kegiatan'

@Table({ tableName: 'komponen', timestamps: false })
export default class Komponen extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  komponen_id: number

  @Column({ type: DataType.STRING, allowNull: false })
  nama_komponen: string

  @Column({ type: DataType.TEXT, allowNull: true })
  deskripsi?: string

  @HasMany(() => Kegiatan, 'komponen_id')
  kegiatan?: Kegiatan[]
}
