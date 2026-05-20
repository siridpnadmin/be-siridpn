import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Stakeholder from './stakeholder'

@Table({ tableName: 'stakeholder_dpn', timestamps: false })
export default class StakeholderDpn extends Model {
  @PrimaryKey
  @ForeignKey(() => Stakeholder)
  @Column({ type: DataType.TEXT, allowNull: false })
  stakeholder_id: string

  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  dpn_id: string

  @BelongsTo(() => Stakeholder, 'stakeholder_id')
  stakeholder?: Stakeholder
}
