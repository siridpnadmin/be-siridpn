import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import Pelaksana from './pelaksana'

@Table({ tableName: 'jenis_pelaksana', timestamps: false })
export default class JenisPelaksana extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  jenis_pelaksana_id: number

  @Column({ type: DataType.STRING, allowNull: false })
  jenis: string

  @Column({ type: DataType.TEXT, allowNull: true })
  deskripsi?: string

  @HasMany(() => Pelaksana, 'jenis_pelaksana_id')
  pelaksana?: Pelaksana[]
}
