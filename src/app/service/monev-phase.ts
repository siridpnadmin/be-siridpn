import { randomUUID } from 'crypto'
import { Op } from 'sequelize'
import ErrorResponse from '~/lib/http/errors'
import Dpn from '../database/entity/dpn'
import Kegiatan from '../database/entity/kegiatan'
import KegiatanPelaksana from '../database/entity/kegiatan-pelaksana'
import LaporanMonev from '../database/entity/laporan-monev'
import MonevPhase from '../database/entity/monev-phase'
import Perpres from '../database/entity/perpres'
import PerpresDpnTahap from '../database/entity/perpres-dpn-tahap'

type MonevPhasePayload = {
  nama_fase: string
  perpres: string
  url_slug: string
  kode_akses: string
  periode: string
  submisi?: string
  status?: 'aktif' | 'nonaktif'
  tanggal_mulai: string
  tanggal_selesai: string
  jumlah_submisi?: number
  total_ra?: number
  perlu_review?: number
}

function toNumber(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function cleanTahapLabel(value?: string | null) {
  return String(value ?? '').trim().replace(/^tahap\s+/i, '')
}

function cleanDocumentText(value: string) {
  return value.replace(/\bTahap\s+Tahap\b/gi, 'Tahap')
}

function documentLabel(document: PerpresDpnTahap) {
  return cleanDocumentText(
    `${document.perpres?.no_perpres ?? ''} - RIDPN ${
      document.dpn?.nama_dpn ?? 'DPN'
    } Tahap ${cleanTahapLabel(document.tahap)}`
  )
}

async function getPhaseSubmissionStats(phase: MonevPhase, documents: PerpresDpnTahap[]) {
  const perpres = cleanDocumentText(String(phase.perpres || ''))
  const targetIds =
    normalizeText(perpres) === 'akses semua'
      ? documents.map((document) => Number(document.perpres_dpn_tahap_id))
      : documents
          .filter((document) => normalizeText(documentLabel(document)) === normalizeText(perpres))
          .map((document) => Number(document.perpres_dpn_tahap_id))

  if (!targetIds.length) {
    return { jumlahSubmisi: 0, totalRa: 0, perluReview: 0 }
  }

  const kegiatanRows = await Kegiatan.findAll({
    where: { perpres_dpn_tahap_id: { [Op.in]: targetIds } },
    attributes: ['kegiatan_id'],
  })
  const kegiatanIds = kegiatanRows.map((row) => Number(row.kegiatan_id))

  if (!kegiatanIds.length) {
    return { jumlahSubmisi: 0, totalRa: 0, perluReview: 0 }
  }

  const laporanRows = await LaporanMonev.findAll({
    include: [
      {
        model: KegiatanPelaksana,
        required: true,
        where: { kegiatan_id: { [Op.in]: kegiatanIds } },
      },
    ],
  })
  const submittedActionIds = new Set<number>()
  const reviewActionIds = new Set<number>()

  for (const laporan of laporanRows) {
    const kegiatanId = Number(laporan.kegiatanPelaksana?.kegiatan_id)
    if (!Number.isFinite(kegiatanId)) continue
    submittedActionIds.add(kegiatanId)
    if (laporan.perlu_review) {
      reviewActionIds.add(kegiatanId)
    }
  }

  return {
    jumlahSubmisi: submittedActionIds.size,
    totalRa: kegiatanIds.length,
    perluReview: reviewActionIds.size,
  }
}

export default class MonevPhaseService {
  async list(page = 1, pageSize = 1000) {
    const limit = Math.max(1, Number(pageSize) || 1000)
    const offset = (Math.max(1, Number(page) || 1) - 1) * limit
    const { rows, count } = await MonevPhase.findAndCountAll({
      where: { deleted_at: null },
      order: [
        ['tanggal_mulai', 'desc'],
        ['created_at', 'desc'],
      ],
      limit,
      offset,
    })

    const documents = await PerpresDpnTahap.findAll({
      include: [{ model: Perpres }, { model: Dpn }],
    })
    const data = await Promise.all(
      rows.map(async (row) => {
        const stats = await getPhaseSubmissionStats(row, documents)
        const plain = row.get({ plain: true }) as any
        return {
          ...plain,
          jumlah_submisi: stats.jumlahSubmisi,
          total_ra: stats.totalRa,
          perlu_review: stats.perluReview,
          submisi: `${stats.jumlahSubmisi} OPD`,
        }
      })
    )

    return { data, total: count }
  }

  private normalizePayload(payload: MonevPhasePayload) {
    const namaFase = String(payload.nama_fase || '').trim()
    const perpres = String(payload.perpres || '').trim()
    const slug = String(payload.url_slug || '').trim()
    const kodeAkses = String(payload.kode_akses || '').trim()

    if (!namaFase || !perpres || !slug || !kodeAkses) {
      throw new ErrorResponse.BadRequest('nama_fase, perpres, url_slug, and kode_akses are required')
    }
    if (!payload.tanggal_mulai || !payload.tanggal_selesai) {
      throw new ErrorResponse.BadRequest('tanggal_mulai and tanggal_selesai are required')
    }

    return {
      nama_fase: namaFase,
      perpres,
      url_slug: slug,
      kode_akses: kodeAkses,
      periode: String(payload.periode || new Date(payload.tanggal_mulai).getFullYear()),
      submisi: payload.submisi || '0 OPD',
      status: payload.status || 'aktif',
      tanggal_mulai: payload.tanggal_mulai,
      tanggal_selesai: payload.tanggal_selesai,
      jumlah_submisi: toNumber(payload.jumlah_submisi),
      total_ra: toNumber(payload.total_ra),
      perlu_review: toNumber(payload.perlu_review),
      updated_at: new Date(),
    }
  }

  async create(payload: MonevPhasePayload) {
    const values = this.normalizePayload(payload)
    const duplicate = await MonevPhase.findOne({
      where: {
        url_slug: values.url_slug,
        deleted_at: null,
      },
    })

    if (duplicate) {
      throw new ErrorResponse.BadRequest('URL slug sudah digunakan.')
    }

    return MonevPhase.create({
      id: randomUUID(),
      ...values,
      created_at: new Date(),
    })
  }

  async update(id: string, payload: MonevPhasePayload) {
    const record = await MonevPhase.findOne({ where: { id, deleted_at: null } })
    if (!record) {
      throw new ErrorResponse.NotFound('Fase pemantauan tidak ditemukan.')
    }

    const values = this.normalizePayload(payload)
    const duplicate = await MonevPhase.findOne({
      where: {
        id: { [Op.ne]: id },
        url_slug: values.url_slug,
        deleted_at: null,
      },
    })

    if (duplicate) {
      throw new ErrorResponse.BadRequest('URL slug sudah digunakan.')
    }

    await record.update(values)
    return record.reload()
  }

  async softDelete(id: string) {
    const record = await MonevPhase.findOne({ where: { id, deleted_at: null } })
    if (!record) {
      throw new ErrorResponse.NotFound('Fase pemantauan tidak ditemukan.')
    }

    await record.update({ deleted_at: new Date(), updated_at: new Date() })
  }
}
