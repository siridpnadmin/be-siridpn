import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import StakeholderDpn from './stakeholder-dpn'
import FilePelaporan from './file-pelaporan'

@Table({ tableName: 'stakeholder', timestamps: false })
export default class Stakeholder extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  stakeholder_id: number

  @Column({ type: DataType.STRING(255), allowNull: true })
  name?: string

  @Column({ type: DataType.ENUM('Pusat', 'Prov', 'Kota/Kab'), allowNull: true })
  type?: string

  @HasMany(() => StakeholderDpn, 'stakeholder_id')
  stakeholderDpn?: StakeholderDpn[]

  @HasMany(() => FilePelaporan, 'stakeholder_id')
  filePelaporan?: FilePelaporan[]
}
