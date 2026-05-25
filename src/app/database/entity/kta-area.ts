import { BelongsTo, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Dpn from './dpn'

@Table({ tableName: 'kta_area', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' })
export default class KtaArea extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false, autoIncrement: true })
  id: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  dpn_id: number

  @Column({ type: DataType.TEXT, allowNull: false })
  nama_kta: string

  @Column({ type: DataType.JSONB, allowNull: false })
  kabupaten_kota: string[]

  @Column({ type: DataType.INTEGER, allowNull: false })
  nomor_urut: number

  @BelongsTo(() => Dpn, 'dpn_id')
  dpn?: Dpn
}
