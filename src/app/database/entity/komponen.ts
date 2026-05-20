import { Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Kegiatan from './kegiatan'

@Table({ tableName: 'komponen', timestamps: false })
export default class Komponen extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  komponen_id: string

  @Column({ type: DataType.TEXT, allowNull: true })
  nama_komponen?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  deskripsi?: string

  @HasMany(() => Kegiatan, 'komponen_id')
  kegiatan: Kegiatan[]
}
