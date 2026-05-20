import { Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Pelaksana from './pelaksana'

@Table({ tableName: 'jenis_pelaksana', timestamps: false })
export default class JenisPelaksana extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  jenis_pelaksana_id: string

  @Column({ type: DataType.TEXT, allowNull: true })
  jenis?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  deskripsi?: string

  @HasMany(() => Pelaksana, 'jenis_pelaksana_id')
  pelaksana: Pelaksana[]
}
