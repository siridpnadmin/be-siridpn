import { Model, ModelStatic, Op } from 'sequelize'
import { useQuery } from '~/lib/query-builder'
import { db } from '../database/connection'
import FilePelaporan from '../database/entity/file-pelaporan'
import JenisPelaksana from '../database/entity/jenis-pelaksana'
import Kegiatan from '../database/entity/kegiatan'
import KegiatanPelaksana from '../database/entity/kegiatan-pelaksana'
import KegiatanTahun from '../database/entity/kegiatan-tahun'
import Komponen from '../database/entity/komponen'
import LaporanMonev from '../database/entity/laporan-monev'
import Pelaksana from '../database/entity/pelaksana'
import Perpres from '../database/entity/perpres'
import PerpresDpnTahap from '../database/entity/perpres-dpn-tahap'
import Stakeholder from '../database/entity/stakeholder'
import StakeholderDpn from '../database/entity/stakeholder-dpn'
import ErrorResponse from '~/lib/http/errors'
import { DtoFindAll, FindParams } from './types'

type LegacyModel = Model & { [key: string]: any }

type LegacyTableConfig = {
  repository: ModelStatic<LegacyModel>
  primaryKey: string
}

type LegacyRencanaAksiPayload = {
  perpres_dpn_tahap_id: string
  no: string
  komponen: string
  kegiatan: string
  lokasi: string
  target: string
  tahun: string[]
  pelaksana: string[]
  status: string
}

type LegacyFilePelaporanPayload = {
  file_pelaporan_id?: string
  perpres_tahap_dpn_d?: string | null
  stakeholder_id?: string | null
  fase?: string | null
  link_file?: string | null
}

const legacyTables = {
  file_pelaporan: {
    repository: FilePelaporan as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'file_pelaporan_id',
  },
  jenis_pelaksana: {
    repository: JenisPelaksana as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'jenis_pelaksana_id',
  },
  kegiatan: {
    repository: Kegiatan as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'kegiatan_id',
  },
  kegiatan_pelaksana: {
    repository: KegiatanPelaksana as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'kegiatan_pelaksana_id',
  },
  kegiatan_tahun: {
    repository: KegiatanTahun as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'kegiatan_id',
  },
  komponen: {
    repository: Komponen as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'komponen_id',
  },
  laporan_monev: {
    repository: LaporanMonev as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'laporan_monev_id',
  },
  pelaksana: {
    repository: Pelaksana as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'pelaksana_id',
  },
  perpres: {
    repository: Perpres as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'perpres_id',
  },
  perpres_dpn_tahap: {
    repository: PerpresDpnTahap as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'perpres_dpn_tahap_id',
  },
  stakeholder: {
    repository: Stakeholder as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'stakeholder_id',
  },
  stakeholder_dpn: {
    repository: StakeholderDpn as unknown as ModelStatic<LegacyModel>,
    primaryKey: 'stakeholder_id',
  },
} satisfies Record<string, LegacyTableConfig>

export type LegacyTableName = keyof typeof legacyTables

export default class LegacyBackupService {
  listTables() {
    return Object.keys(legacyTables)
  }

  private getConfig(table: string): LegacyTableConfig {
    const config = legacyTables[table as LegacyTableName]

    if (!config) {
      throw new ErrorResponse.NotFound('legacy table not found')
    }

    return config
  }

  async find(
    table: string,
    { page, pageSize, filtered = [], sorted = [] }: FindParams
  ): Promise<DtoFindAll<LegacyModel>> {
    const { repository, primaryKey } = this.getConfig(table)
    const query = useQuery({
      model: repository,
      reqQuery: { page, pageSize, filtered, sorted },
      includeRule: [],
    })

    const data = await repository.findAll({
      ...query,
      order: query.order ? query.order : [[primaryKey, 'asc']],
    })

    const total = await repository.count({
      where: query.where,
    })

    return { data, total }
  }

  async findById(table: string, id: string): Promise<LegacyModel> {
    const { repository, primaryKey } = this.getConfig(table)
    const record = await repository.findOne({
      where: { [primaryKey]: id },
    })

    if (!record) {
      throw new ErrorResponse.NotFound('legacy record not found')
    }

    return record
  }

  async createFilePelaporan(payload: LegacyFilePelaporanPayload) {
    const file_pelaporan_id =
      payload.file_pelaporan_id || (await this.nextTextId('file_pelaporan', 'file_pelaporan_id'))

    return FilePelaporan.create({
      file_pelaporan_id,
      perpres_tahap_dpn_d: payload.perpres_tahap_dpn_d ?? null,
      stakeholder_id: payload.stakeholder_id ?? null,
      fase: payload.fase ?? null,
      link_file: payload.link_file ?? null,
    })
  }

  async updateFilePelaporan(id: string, payload: LegacyFilePelaporanPayload) {
    const record = await FilePelaporan.findOne({ where: { file_pelaporan_id: id } })

    if (!record) {
      throw new ErrorResponse.NotFound('legacy file pelaporan not found')
    }

    await record.update({
      perpres_tahap_dpn_d: payload.perpres_tahap_dpn_d ?? record.getDataValue('perpres_tahap_dpn_d'),
      stakeholder_id: payload.stakeholder_id ?? record.getDataValue('stakeholder_id'),
      fase: payload.fase ?? record.getDataValue('fase'),
      link_file: payload.link_file ?? record.getDataValue('link_file'),
    })

    return record
  }

  async deleteFilePelaporan(id: string) {
    await FilePelaporan.destroy({ where: { file_pelaporan_id: id } })
  }

  private normalizeLegacyStatus(status: string) {
    const statusMap: Record<string, string> = {
      terlaksana: 'terlaksana',
      sedang: 'sedang dilaksanakan',
      belum: 'belum terlaksana',
      tidakDiketahui: 'belum dikonfirmasi',
      belumDiisi: 'belum dikonfirmasi',
    }

    return statusMap[status] ?? status
  }

  private yearToLegacyId(year: string) {
    const numeric = Number(year)
    if (!Number.isFinite(numeric)) return year

    return String(numeric >= 2020 ? numeric - 2020 : numeric)
  }

  private async nextTextId(tableName: string, columnName: string) {
    const [rows] = (await db.sequelize.query(`
      SELECT COALESCE(MAX(NULLIF(${columnName}, '')::int), 0) + 1 AS next_id
      FROM ${tableName}
      WHERE ${columnName} ~ '^[0-9]+$';
    `)) as [{ next_id: number }[], unknown]

    return String(rows[0]?.next_id ?? 1)
  }

  private async komponenIdByName(name: string) {
    const record = await Komponen.findOne({ where: { nama_komponen: name } })
    return record?.getDataValue('komponen_id') ?? null
  }

  private async pelaksanaIdsByNames(names: string[]) {
    if (names.length === 0) return []

    const records = await Pelaksana.findAll({
      where: { nama_pelaksana: { [Op.in]: names } },
    })
    const idByName = new Map(
      records.map((record) => [
        record.getDataValue('nama_pelaksana') as string,
        record.getDataValue('pelaksana_id') as string,
      ])
    )

    return names
      .map((name) => idByName.get(name))
      .filter((id): id is string => Boolean(id))
  }

  private async syncKegiatanTahun(kegiatanId: string, years: string[]) {
    await KegiatanTahun.destroy({ where: { kegiatan_id: kegiatanId } })

    const rows = years
      .map((year) => this.yearToLegacyId(year))
      .filter(Boolean)
      .map((tahun_id) => ({ kegiatan_id: kegiatanId, tahun_id }))

    if (rows.length > 0) {
      await KegiatanTahun.bulkCreate(rows)
    }
  }

  private async syncKegiatanPelaksana(kegiatanId: string, pelaksanaNames: string[]) {
    await KegiatanPelaksana.destroy({ where: { kegiatan_id: kegiatanId } })

    const pelaksanaIds = await this.pelaksanaIdsByNames(pelaksanaNames)
    let nextId = Number(await this.nextTextId('kegiatan_pelaksana', 'kegiatan_pelaksana_id'))
    const rows = pelaksanaIds.map((pelaksana_id) => ({
      kegiatan_pelaksana_id: String(nextId++),
      kegiatan_id: kegiatanId,
      pelaksana_id,
      catatan: null,
    }))

    if (rows.length > 0) {
      await KegiatanPelaksana.bulkCreate(rows)
    }
  }

  async createRencanaAksi(payload: LegacyRencanaAksiPayload) {
    const kegiatan_id = await this.nextTextId('kegiatan', 'kegiatan_id')
    const komponen_id = await this.komponenIdByName(payload.komponen)

    const record = await Kegiatan.create({
      kegiatan_id,
      komponen_id,
      no: payload.no,
      deskripsi_kegiatan: payload.kegiatan,
      target: payload.target,
      status: this.normalizeLegacyStatus(payload.status),
      lokasi: payload.lokasi,
      perpres_dpn_tahap_id: payload.perpres_dpn_tahap_id,
    })

    await this.syncKegiatanTahun(kegiatan_id, payload.tahun)
    await this.syncKegiatanPelaksana(kegiatan_id, payload.pelaksana)

    return record
  }

  async updateRencanaAksi(id: string, payload: LegacyRencanaAksiPayload) {
    const record = await Kegiatan.findOne({ where: { kegiatan_id: id } })

    if (!record) {
      throw new ErrorResponse.NotFound('legacy rencana aksi not found')
    }

    const komponen_id = await this.komponenIdByName(payload.komponen)
    await record.update({
      komponen_id,
      no: payload.no,
      deskripsi_kegiatan: payload.kegiatan,
      target: payload.target,
      status: this.normalizeLegacyStatus(payload.status),
      lokasi: payload.lokasi,
      perpres_dpn_tahap_id: payload.perpres_dpn_tahap_id,
    })

    await this.syncKegiatanTahun(id, payload.tahun)
    await this.syncKegiatanPelaksana(id, payload.pelaksana)

    return record
  }

  async deleteRencanaAksi(id: string) {
    await KegiatanTahun.destroy({ where: { kegiatan_id: id } })
    await KegiatanPelaksana.destroy({ where: { kegiatan_id: id } })
    await Kegiatan.destroy({ where: { kegiatan_id: id } })
  }
}
