import { Model, ModelStatic, Op } from 'sequelize'
import type { QueryFilters, QuerySorts } from '~/lib/query-builder/types'
import ErrorResponse from '~/lib/http/errors'
import { useQuery } from '~/lib/query-builder'
import Tahun from '../database/entity/tahun'
import Dpn from '../database/entity/dpn'
import JenisPelaksana from '../database/entity/jenis-pelaksana'
import Komponen from '../database/entity/komponen'
import Perpres from '../database/entity/perpres'
import PerpresDpnTahap from '../database/entity/perpres-dpn-tahap'
import Stakeholder from '../database/entity/stakeholder'
import StakeholderDpn from '../database/entity/stakeholder-dpn'
import Pelaksana from '../database/entity/pelaksana'
import Kegiatan from '../database/entity/kegiatan'
import KegiatanTahun from '../database/entity/kegiatan-tahun'
import KegiatanPelaksana from '../database/entity/kegiatan-pelaksana'
import LaporanMonev from '../database/entity/laporan-monev'
import FilePelaporan from '../database/entity/file-pelaporan'
import KtaArea from '../database/entity/kta-area'

type CsvModel = Model & { [key: string]: any }

type CsvTableConfig = {
  repository: ModelStatic<CsvModel>
  primaryKeys: string[]
}

type FindParams = {
  page?: string | number
  pageSize?: string | number
  filtered?: QueryFilters[]
  sorted?: QuerySorts[]
}

const csvTables = {
  tahun: {
    repository: Tahun as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["tahun_id"],
  },
  dpn: {
    repository: Dpn as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["dpn_id"],
  },
  jenis_pelaksana: {
    repository: JenisPelaksana as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["jenis_pelaksana_id"],
  },
  komponen: {
    repository: Komponen as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["komponen_id"],
  },
  perpres: {
    repository: Perpres as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["perpres_id"],
  },
  perpres_dpn_tahap: {
    repository: PerpresDpnTahap as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["perpres_dpn_tahap_id"],
  },
  stakeholder: {
    repository: Stakeholder as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["stakeholder_id"],
  },
  stakeholder_dpn: {
    repository: StakeholderDpn as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["stakeholder_id","dpn_id"],
  },
  pelaksana: {
    repository: Pelaksana as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["pelaksana_id"],
  },
  kegiatan: {
    repository: Kegiatan as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["kegiatan_id"],
  },
  kegiatan_tahun: {
    repository: KegiatanTahun as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["kegiatan_id","tahun_id"],
  },
  kegiatan_pelaksana: {
    repository: KegiatanPelaksana as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["kegiatan_pelaksana_id"],
  },
  laporan_monev: {
    repository: LaporanMonev as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["laporan_monev_id"],
  },
  file_pelaporan: {
    repository: FilePelaporan as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["file_pelaporan_id"],
  },
  kta_area: {
    repository: KtaArea as unknown as ModelStatic<CsvModel>,
    primaryKeys: ["id"],
  },
} satisfies Record<string, CsvTableConfig>

export type CsvTableName = keyof typeof csvTables

export default class CsvDataService {
  listTables() {
    return Object.entries(csvTables).map(([table, config]) => ({
      table,
      primaryKeys: config.primaryKeys,
      columns: Object.keys(config.repository.rawAttributes),
    }))
  }

  private getConfig(table: string): CsvTableConfig {
    const normalizedTable = table.replace(/-/g, '_')
    const config = csvTables[normalizedTable as CsvTableName]

    if (!config) {
      throw new ErrorResponse.NotFound('CSV table not found')
    }

    return config
  }

  private buildPrimaryKeyWhere(config: CsvTableConfig, id: string) {
    if (config.primaryKeys.length !== 1) {
      throw new ErrorResponse.BadRequest('This table uses composite primary keys. Use query filters instead.')
    }

    return { [config.primaryKeys[0]]: id }
  }

  private async assertKegiatanNumberIsUnique(
    table: string,
    values: Record<string, unknown>,
    excludeId?: string
  ) {
    const normalizedTable = table.replace(/-/g, '_')
    if (normalizedTable !== 'kegiatan') return

    const no = typeof values.no === 'string' ? values.no.trim() : values.no
    const perpresDpnTahapId = values.perpres_dpn_tahap_id

    if (!no || perpresDpnTahapId === undefined || perpresDpnTahapId === null) return

    const existing = await Kegiatan.findOne({
      where: {
        no,
        perpres_dpn_tahap_id: perpresDpnTahapId,
        ...(excludeId ? { kegiatan_id: { [Op.ne]: excludeId } } : {}),
      },
    })

    if (existing) {
      throw new ErrorResponse.BadRequest('Nomor rencana aksi sudah digunakan pada dokumen ini.')
    }
  }

  async find(table: string, { page, pageSize, filtered = [], sorted = [] }: FindParams) {
    const { repository, primaryKeys } = this.getConfig(table)
    const query = useQuery({
      model: repository,
      reqQuery: { page, pageSize, filtered, sorted },
      includeRule: [],
    })

    const data = await repository.findAll({
      ...query,
      order: Array.isArray(query.order) && query.order.length ? query.order : primaryKeys.map((key) => [key, 'asc']),
    })

    const total = await repository.count({ where: query.where })

    return { data, total }
  }

  async findById(table: string, id: string) {
    const config = this.getConfig(table)
    const record = await config.repository.findOne({ where: this.buildPrimaryKeyWhere(config, id) })

    if (!record) {
      throw new ErrorResponse.NotFound('CSV record not found')
    }

    return record
  }

  async create(table: string, payload: Record<string, unknown>) {
    const { repository, primaryKeys } = this.getConfig(table)
    const values = { ...payload }
    const normalizedTable = table.replace(/-/g, '_')

    if (primaryKeys.length === 1 && values[primaryKeys[0]] === undefined) {
      const primaryKey = primaryKeys[0]
      const maxId = await repository.max(primaryKey)
      values[primaryKey] = Number(maxId || 0) + 1
    }

    if (normalizedTable === 'laporan_monev') {
      const now = new Date()
      values.created_at = values.created_at ?? now
      values.updated_at = values.updated_at ?? values.created_at
    }

    await this.assertKegiatanNumberIsUnique(table, values)

    return repository.create(values as any)
  }

  async update(table: string, id: string, payload: Record<string, unknown>) {
    const config = this.getConfig(table)
    const record = await config.repository.findOne({ where: this.buildPrimaryKeyWhere(config, id) })

    if (!record) {
      throw new ErrorResponse.NotFound('CSV record not found')
    }

    const nextValues = { ...record.get(), ...payload }
    await this.assertKegiatanNumberIsUnique(table, nextValues, id)

    const normalizedTable = table.replace(/-/g, '_')
    const values =
      normalizedTable === 'laporan_monev'
        ? { ...payload, updated_at: new Date() }
        : payload

    await record.update(values)
    return record
  }

  async delete(table: string, id: string) {
    const config = this.getConfig(table)
    const deleted = await config.repository.destroy({ where: this.buildPrimaryKeyWhere(config, id) })

    if (!deleted) {
      throw new ErrorResponse.NotFound('CSV record not found')
    }
  }
}
