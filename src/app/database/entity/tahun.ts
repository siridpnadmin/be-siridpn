import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import KegiatanTahun from './kegiatan-tahun'

@Table({ tableName: 'tahun', timestamps: false })
export default class Tahun extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  tahun_id: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  tahun_text: number

  @HasMany(() => KegiatanTahun, 'tahun_id')
  kegiatanTahun?: KegiatanTahun[]
}
