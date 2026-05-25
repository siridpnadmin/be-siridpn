import { Column, DataType, Model, PrimaryKey, Table, BelongsTo, HasMany } from 'sequelize-typescript'
import PerpresDpnTahap from './perpres-dpn-tahap'
import StakeholderDpn from './stakeholder-dpn'
import UserDpnAccess from './user-dpn-access'
import KtaArea from './kta-area'

@Table({ tableName: 'dpn', timestamps: false })
export default class Dpn extends Model {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, allowNull: false })
  dpn_id: number

  @Column({ type: DataType.TEXT, allowNull: false })
  kode: string

  @Column({ type: DataType.TEXT, allowNull: false })
  nama_dpn: string

  @Column({ type: DataType.DOUBLE, allowNull: true })
  lat_pusat?: number

  @Column({ type: DataType.DOUBLE, allowNull: true })
  long_pusat?: number

  @Column({ type: DataType.TEXT, allowNull: true })
  public_thumbnail?: string

  @HasMany(() => PerpresDpnTahap, 'dpn_id')
  perpresDpnTahap?: PerpresDpnTahap[]

  @HasMany(() => StakeholderDpn, 'dpn_id')
  stakeholderDpn?: StakeholderDpn[]

  @HasMany(() => UserDpnAccess, 'dpn_id')
  userDpnAccess?: UserDpnAccess[]

  @HasMany(() => KtaArea, 'dpn_id')
  ktaArea?: KtaArea[]
}
