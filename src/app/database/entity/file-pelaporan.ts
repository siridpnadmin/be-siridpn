import { Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

@Table({ tableName: 'file_pelaporan', timestamps: false })
export default class FilePelaporan extends Model {
  @PrimaryKey
  @Column({ type: DataType.TEXT, allowNull: false })
  file_pelaporan_id: string

  @Column({ type: DataType.TEXT, allowNull: true })
  perpres_tahap_dpn_d?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  stakeholder_id?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  fase?: string

  @Column({ type: DataType.TEXT, allowNull: true })
  link_file?: string
}
