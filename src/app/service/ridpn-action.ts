import { Op } from 'sequelize'
import ErrorResponse from '~/lib/http/errors'
import { db } from '../database/connection'
import Kegiatan from '../database/entity/kegiatan'
import KegiatanPelaksana from '../database/entity/kegiatan-pelaksana'
import KegiatanTahun from '../database/entity/kegiatan-tahun'
import Komponen from '../database/entity/komponen'
import LaporanMonev from '../database/entity/laporan-monev'
import Pelaksana from '../database/entity/pelaksana'
import Tahun from '../database/entity/tahun'

type RidpnActionStatus =
  | 'terlaksana'
  | 'sedang dilaksanakan'
  | 'belum terlaksana'
  | 'tidak diketahui'
  | 'belum dikonfirmasi'

type RidpnActionPayload = {
  kegiatan_id?: string | number | null
  perpres_dpn_tahap_id: string | number
  komponen_id?: string | number | null
  komponen?: string | null
  no: string
  deskripsi_kegiatan: string
  lokasi: string
  target: string
  status: RidpnActionStatus
  tahun?: Array<string | number>
  pelaksana?: string[]
}

async function nextId(model: any, primaryKey: string, transaction: any) {
  const maxId = await model.max(primaryKey, { transaction })
  return Number(maxId || 0) + 1
}

function cleanList<T>(items?: T[]) {
  return Array.from(
    new Set(
      (items ?? [])
        .map((item) => String(item ?? '').trim())
        .filter(Boolean)
    )
  )
}

export default class RidpnActionService {
  async list(perpresDpnTahapId: string | number) {
    const kegiatanRows = await Kegiatan.findAll({
      where: { perpres_dpn_tahap_id: Number(perpresDpnTahapId) },
      order: [['no', 'asc']],
    })
    const kegiatanIds = kegiatanRows.map((row) => Number(row.kegiatan_id))

    if (!kegiatanIds.length) {
      return []
    }

    const [komponenRows, tahunRows, kegiatanTahunRows, pelaksanaRows, kegiatanPelaksanaRows] =
      await Promise.all([
        Komponen.findAll(),
        Tahun.findAll(),
        KegiatanTahun.findAll({ where: { kegiatan_id: { [Op.in]: kegiatanIds } } }),
        Pelaksana.findAll(),
        KegiatanPelaksana.findAll({ where: { kegiatan_id: { [Op.in]: kegiatanIds } } }),
      ])

    const komponenById = new Map(
      komponenRows.map((row) => [Number(row.komponen_id), row.nama_komponen])
    )
    const tahunById = new Map(
      tahunRows.map((row) => [Number(row.tahun_id), String(row.tahun_text)])
    )
    const pelaksanaById = new Map(
      pelaksanaRows.map((row) => [Number(row.pelaksana_id), row.nama_pelaksana])
    )
    const tahunByKegiatanId = new Map<number, string[]>()
    for (const row of kegiatanTahunRows) {
      const kegiatanId = Number(row.kegiatan_id)
      const tahun = tahunById.get(Number(row.tahun_id))
      if (!tahun) continue
      const current = tahunByKegiatanId.get(kegiatanId) ?? []
      current.push(tahun)
      tahunByKegiatanId.set(kegiatanId, current)
    }
    const pelaksanaByKegiatanId = new Map<number, string[]>()
    for (const row of kegiatanPelaksanaRows) {
      const kegiatanId = Number(row.kegiatan_id)
      const pelaksana = pelaksanaById.get(Number(row.pelaksana_id))
      if (!pelaksana) continue
      const current = pelaksanaByKegiatanId.get(kegiatanId) ?? []
      current.push(pelaksana)
      pelaksanaByKegiatanId.set(kegiatanId, current)
    }

    return kegiatanRows.map((row) => {
      const kegiatanId = Number(row.kegiatan_id)
      return {
        ...row.get(),
        komponen: komponenById.get(Number(row.komponen_id)) ?? null,
        tahun: tahunByKegiatanId.get(kegiatanId) ?? [],
        pelaksana: pelaksanaByKegiatanId.get(kegiatanId) ?? [],
      }
    })
  }

  private async resolveKomponenId(payload: RidpnActionPayload, transaction: any) {
    if (payload.komponen_id) return Number(payload.komponen_id)
    if (!payload.komponen) return 1

    const komponen = await Komponen.findOne({
      where: { nama_komponen: payload.komponen },
      transaction,
    })

    return Number(komponen?.komponen_id ?? 1)
  }

  private async resolveTahunIds(tahun: Array<string | number> | undefined, transaction: any) {
    const values = cleanList(tahun)
    const ids: number[] = []

    for (const value of values) {
      let record = await Tahun.findOne({
        where: { tahun_text: Number(value) },
        transaction,
      })

      if (!record) {
        record = await Tahun.create(
          {
            tahun_id: await nextId(Tahun, 'tahun_id', transaction),
            tahun_text: Number(value),
          },
          { transaction }
        )
      }

      ids.push(Number(record.tahun_id))
    }

    return ids
  }

  private async resolvePelaksanaIds(pelaksana: string[] | undefined, transaction: any) {
    const names = cleanList(pelaksana)
    const ids: number[] = []

    for (const name of names) {
      let record = await Pelaksana.findOne({
        where: { nama_pelaksana: name },
        transaction,
      })

      if (!record) {
        record = await Pelaksana.create(
          {
            pelaksana_id: await nextId(Pelaksana, 'pelaksana_id', transaction),
            jenis_pelaksana_id: 1,
            nama_pelaksana: name,
            catatan: null,
          },
          { transaction }
        )
      }

      ids.push(Number(record.pelaksana_id))
    }

    return ids
  }

  private async syncPelaksana(savedKegiatanId: number, pelaksanaIds: number[], transaction: any) {
    const existingRows = await KegiatanPelaksana.findAll({
      where: { kegiatan_id: savedKegiatanId },
      transaction,
    })
    const desiredPelaksanaIds = new Set(pelaksanaIds)
    const existingPelaksanaIds = new Set(existingRows.map((row) => Number(row.pelaksana_id)))
    const rowsToDelete = existingRows.filter((row) => !desiredPelaksanaIds.has(Number(row.pelaksana_id)))

    if (rowsToDelete.length) {
      const kegiatanPelaksanaIds = rowsToDelete.map((row) => Number(row.kegiatan_pelaksana_id))
      const usedCount = await LaporanMonev.count({
        where: { kegiatan_pelaksana_id: { [Op.in]: kegiatanPelaksanaIds } },
        transaction,
      })

      if (usedCount > 0) {
        throw new ErrorResponse.BadRequest(
          'Pelaksana tidak bisa dihapus karena sudah memiliki laporan monev.'
        )
      }

      await KegiatanPelaksana.destroy({
        where: { kegiatan_pelaksana_id: { [Op.in]: kegiatanPelaksanaIds } },
        transaction,
      })
    }

    const pelaksanaIdsToCreate = pelaksanaIds.filter((pelaksanaId) => !existingPelaksanaIds.has(pelaksanaId))
    if (!pelaksanaIdsToCreate.length) return

    let nextKegiatanPelaksanaId = await nextId(KegiatanPelaksana, 'kegiatan_pelaksana_id', transaction)
    await KegiatanPelaksana.bulkCreate(
      pelaksanaIdsToCreate.map((pelaksanaId) => ({
        kegiatan_pelaksana_id: nextKegiatanPelaksanaId++,
        kegiatan_id: savedKegiatanId,
        pelaksana_id: pelaksanaId,
        catatan: null,
      })),
      { transaction }
    )
  }

  async save(payload: RidpnActionPayload, kegiatanId?: string | number) {
    if (!payload.perpres_dpn_tahap_id) {
      throw new ErrorResponse.BadRequest('Dokumen RIDPN wajib diisi.')
    }

    const no = String(payload.no || '').trim()
    if (!no) {
      throw new ErrorResponse.BadRequest('Nomor rencana aksi wajib diisi.')
    }

    return db.sequelize.transaction(async (transaction) => {
      const targetId = kegiatanId || payload.kegiatan_id
      const existing = targetId
        ? await Kegiatan.findByPk(targetId, { transaction })
        : null

      const duplicate = await Kegiatan.findOne({
        where: {
          no,
          perpres_dpn_tahap_id: Number(payload.perpres_dpn_tahap_id),
          ...(targetId ? { kegiatan_id: { [Op.ne]: Number(targetId) } } : {}),
        },
        transaction,
      })

      if (duplicate) {
        throw new ErrorResponse.BadRequest('Nomor rencana aksi sudah digunakan pada dokumen ini.')
      }

      const komponenId = await this.resolveKomponenId(payload, transaction)
      const values = {
        komponen_id: komponenId,
        no,
        deskripsi_kegiatan: payload.deskripsi_kegiatan || '-',
        lokasi: payload.lokasi || '-',
        target: payload.target || '-',
        status: payload.status || 'belum dikonfirmasi',
        perpres_dpn_tahap_id: Number(payload.perpres_dpn_tahap_id),
      }

      const kegiatan =
        existing ??
        (await Kegiatan.create(
          {
            kegiatan_id: await nextId(Kegiatan, 'kegiatan_id', transaction),
            ...values,
          },
          { transaction }
        ))

      if (existing) {
        await kegiatan.update(values, { transaction })
      }

      const savedKegiatanId = Number(kegiatan.kegiatan_id)
      const tahunIds = await this.resolveTahunIds(payload.tahun, transaction)
      const pelaksanaIds = await this.resolvePelaksanaIds(payload.pelaksana, transaction)

      await KegiatanTahun.destroy({
        where: { kegiatan_id: savedKegiatanId },
        transaction,
      })

      if (tahunIds.length) {
        await KegiatanTahun.bulkCreate(
          tahunIds.map((tahunId) => ({
            kegiatan_id: savedKegiatanId,
            tahun_id: tahunId,
            catatan: null,
          })),
          { transaction }
        )
      }

      await this.syncPelaksana(savedKegiatanId, pelaksanaIds, transaction)

      return Kegiatan.findByPk(savedKegiatanId, { transaction })
    })
  }

  async delete(kegiatanId: string | number) {
    return db.sequelize.transaction(async (transaction) => {
      await KegiatanTahun.destroy({ where: { kegiatan_id: kegiatanId }, transaction })
      const kegiatanPelaksanaRows = await KegiatanPelaksana.findAll({
        where: { kegiatan_id: kegiatanId },
        transaction,
      })
      const kegiatanPelaksanaIds = kegiatanPelaksanaRows.map((row) => Number(row.kegiatan_pelaksana_id))
      if (kegiatanPelaksanaIds.length) {
        const usedCount = await LaporanMonev.count({
          where: { kegiatan_pelaksana_id: { [Op.in]: kegiatanPelaksanaIds } },
          transaction,
        })

        if (usedCount > 0) {
          throw new ErrorResponse.BadRequest(
            'Rencana aksi tidak bisa dihapus karena sudah memiliki laporan monev.'
          )
        }

        await KegiatanPelaksana.destroy({
          where: { kegiatan_pelaksana_id: { [Op.in]: kegiatanPelaksanaIds } },
          transaction,
        })
      }
      const deleted = await Kegiatan.destroy({ where: { kegiatan_id: kegiatanId }, transaction })

      if (!deleted) {
        throw new ErrorResponse.NotFound('Rencana aksi tidak ditemukan.')
      }
    })
  }
}
