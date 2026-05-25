import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import Stakeholder from './stakeholder'
import Dpn from './dpn'

@Table({ tableName: 'stakeholder_dpn', timestamps: false })
export default class StakeholderDpn extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false })
  stakeholder_id: number

  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false })
  dpn_id: number

  @BelongsTo(() => Stakeholder, 'stakeholder_id')
  stakeholder?: Stakeholder

  @BelongsTo(() => Dpn, 'dpn_id')
  dpn?: Dpn
}
