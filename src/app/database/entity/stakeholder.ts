import { Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import StakeholderDpn from './stakeholder-dpn'

@Table({ tableName: 'stakeholder', timestamps: false })
export default class Stakeholder extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  stakeholder_id: string

  @Column({ type: DataType.TEXT, allowNull: true })
  name?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  type?: string

  @HasMany(() => StakeholderDpn, 'stakeholder_id')
  stakeholderDpn: StakeholderDpn[]
}
