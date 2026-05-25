import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import Stakeholder from './stakeholder'
import PerpresDpnTahap from './perpres-dpn-tahap'

@Table({ tableName: 'file_pelaporan', timestamps: false })
export default class FilePelaporan extends Model {
  @PrimaryKey
  @Column({ type: DataType.INTEGER, allowNull: false })
  file_pelaporan_id: number

  @Column({ type: DataType.INTEGER, allowNull: false })
  perpres_tahap_dpn_d: number

  @Column({ type: DataType.INTEGER, allowNull: false })
  stakeholder_id: number

  @Column({ type: DataType.ENUM('Fase 1', 'Fase 2'), allowNull: false })
  fase: string

  @Column({ type: DataType.TEXT, allowNull: true })
  link_file?: string

  @BelongsTo(() => Stakeholder, 'stakeholder_id')
  stakeholder?: Stakeholder

  @BelongsTo(() => PerpresDpnTahap, { foreignKey: 'perpres_tahap_dpn_d', targetKey: 'perpres_dpn_tahap_id' })
  perpresDpnTahap?: PerpresDpnTahap
}
