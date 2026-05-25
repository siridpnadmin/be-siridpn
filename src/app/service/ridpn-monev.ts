import { Op } from 'sequelize'
import { unlink } from 'fs/promises'
import { storage } from '~/config/storage'
import { storageExists } from '~/lib/boolean'
import ErrorResponse from '~/lib/http/errors'
import { db } from '../database/connection'
import Kegiatan from '../database/entity/kegiatan'
import KegiatanPelaksana from '../database/entity/kegiatan-pelaksana'
import LaporanMonev from '../database/entity/laporan-monev'
import Pelaksana from '../database/entity/pelaksana'
import PerpresDpnTahap from '../database/entity/perpres-dpn-tahap'
import NotificationService, { type CurrentUser } from './notification'

type MonevStatus =
  | 'terlaksana'
  | 'sedang dilaksanakan'
  | 'belum terlaksana'
  | 'tidak diketahui'
  | 'belum dikonfirmasi'

type MonevPayload = {
  laporan_monev_id?: string | number | null
  kegiatan_pelaksana_id: string | number
  status_kegiatan?: string | null
  konfirmasi_satker?: string | null
  uraian_keterangan?: string | null
  pagu_anggaran?: string | number | null
  realisasi_anggaran?: string | number | null
  kendala?: string | null
  tindak_lanjut?: string | null
  link_bukti?: string | null
  bukti_tipe?: string | null
  progress_semester_1?: string | number | null
  progress_semester_2?: string | number | null
  indikator?: string | null
  output?: string | null
  outcome?: string | null
  nama_pejabat_penanggung_jawab?: string | null
  jabatan_penanggung_jawab?: string | null
  nama_operator?: string | null
  nomor_email_kontak?: string | null
  perlu_review?: string | boolean | number | null
}

async function nextId(model: any, primaryKey: string, transaction: any) {
  const maxId = await model.max(primaryKey, { transaction })
  return Number(maxId || 0) + 1
}

function normalizeStatus(value?: string | null): MonevStatus {
  const status = String(value || '').trim().toLowerCase()
  if (status === 'sedang' || status.includes('sedang')) return 'sedang dilaksanakan'
  if (status === 'belum' || status.includes('belum terlaksana')) return 'belum terlaksana'
  if (status === 'tidakdiketahui' || status.includes('tidak')) return 'tidak diketahui'
  if (status === 'belumdiisi' || status.includes('belum dikonfirmasi') || status.includes('belum diisi')) {
    return 'belum dikonfirmasi'
  }
  if (status.includes('terlaksana')) return 'terlaksana'
  return 'belum dikonfirmasi'
}

function toNumber(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return null
  const normalized = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''))
  return Number.isFinite(normalized) ? normalized : null
}

function toBoolean(value?: string | boolean | number | null) {
  if (value === null || value === undefined || value === '') return undefined
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value > 0
  const normalized = String(value).trim().toLowerCase()
  return ['1', 'true', 'yes', 'ya', 'y'].includes(normalized)
}

function serializeLaporanMonev(laporan: LaporanMonev) {
  const values = laporan.get({ plain: true })

  return {
    ...values,
    created_at: values.created_at ?? null,
    updated_at: values.updated_at ?? values.created_at ?? null,
  }
}

export default class RidpnMonevService {
  private notificationService = new NotificationService()

  async list(perpresDpnTahapId: string | number) {
    const kegiatanRows = await Kegiatan.findAll({
      where: { perpres_dpn_tahap_id: Number(perpresDpnTahapId) },
      order: [['no', 'asc']],
    })
    const kegiatanIds = kegiatanRows.map((row) => Number(row.kegiatan_id))

    if (!kegiatanIds.length) {
      return []
    }

    const kegiatanPelaksanaRows = await KegiatanPelaksana.findAll({
      where: { kegiatan_id: { [Op.in]: kegiatanIds } },
      include: [
        { model: Pelaksana },
        { model: LaporanMonev },
      ],
      order: [
        ['kegiatan_id', 'asc'],
        ['kegiatan_pelaksana_id', 'asc'],
      ],
    })

    return kegiatanPelaksanaRows.map((row) => ({
      kegiatan_pelaksana_id: row.kegiatan_pelaksana_id,
      kegiatan_id: row.kegiatan_id,
      pelaksana_id: row.pelaksana_id,
      nama_pelaksana: row.pelaksana?.nama_pelaksana ?? null,
      laporan: (row.laporanMonev ?? [])
        .sort((left, right) => Number(right.laporan_monev_id) - Number(left.laporan_monev_id))
        .map((laporan) => serializeLaporanMonev(laporan)),
    }))
  }

  private async notifyMonevSaved(record: Record<string, any>, actor?: CurrentUser | null) {
    const kegiatanPelaksana = await KegiatanPelaksana.findByPk(record.kegiatan_pelaksana_id, {
      include: [
        { model: Pelaksana },
        {
          model: Kegiatan,
          include: [{ model: PerpresDpnTahap }],
        },
      ],
    })
    const reporterName =
      record.nama_operator ||
      record.nama_pejabat_penanggung_jawab ||
      record.konfirmasi_satker ||
      null
    const actorName = reporterName || actor?.name || actor?.email || 'Kontributor'
    const pelaksanaName = kegiatanPelaksana?.pelaksana?.nama_pelaksana || record.konfirmasi_satker || 'Pelaksana'
    const status = record.status_kegiatan || 'belum dikonfirmasi'
    const document = kegiatanPelaksana?.kegiatan?.perpresDpnTahap
    const dpnId = document?.dpn_id
    const documentId = document?.perpres_dpn_tahap_id
    const link =
      dpnId && documentId
        ? `/admin/ridpn/${dpnId}/${documentId}/monitoring-evaluasi`
        : '/admin/ridpn'

    await this.notificationService.createForRolesAndDpnLocalAdmins(['super_admin', 'manager_admin'], dpnId, {
      actor_user_id: reporterName ? null : actor?.id ?? null,
      type: record.perlu_review ? 'warning' : 'info',
      category: 'monev',
      title: record.perlu_review ? 'Monev perlu review' : 'Monev diperbarui',
      message: `${actorName} memperbarui monev ${pelaksanaName} dengan status ${status}.`,
      link,
      metadata: {
        laporan_monev_id: record.laporan_monev_id,
        kegiatan_pelaksana_id: record.kegiatan_pelaksana_id,
        dpn_id: dpnId ?? null,
        perpres_dpn_tahap_id: documentId ?? null,
        status_kegiatan: record.status_kegiatan,
        perlu_review: record.perlu_review,
      },
    })
  }

  async save(payload: MonevPayload, file?: Express.Multer.File, actor?: CurrentUser | null) {
    if (!payload.kegiatan_pelaksana_id) {
      throw new ErrorResponse.BadRequest('Pelaksana rencana aksi wajib diisi.')
    }

    let linkBukti = payload.link_bukti ?? null
    let buktiTipe = payload.bukti_tipe || (linkBukti ? 'link' : null)
    if (file) {
      if (!storageExists()) {
        throw new ErrorResponse.BadRequest('Storage MinIO belum dikonfigurasi.')
      }
      const upload = await storage.uploadFile({
        directory: 'monev',
        file,
      })
      linkBukti = upload.signedUrl
      buktiTipe = 'file'
      await unlink(file.path).catch(() => undefined)
    }

    const record = await db.sequelize.transaction(async (transaction) => {
      const targetId = payload.laporan_monev_id
      const existing = targetId
        ? await LaporanMonev.findByPk(targetId, { transaction })
        : await LaporanMonev.findOne({
            where: { kegiatan_pelaksana_id: Number(payload.kegiatan_pelaksana_id) },
            transaction,
          })

      const values = {
        kegiatan_pelaksana_id: Number(payload.kegiatan_pelaksana_id),
        status_kegiatan: normalizeStatus(payload.status_kegiatan),
        konfirmasi_satker: payload.konfirmasi_satker || null,
        uraian_keterangan: payload.uraian_keterangan || null,
        pagu_anggaran: toNumber(payload.pagu_anggaran),
        realisasi_anggaran: toNumber(payload.realisasi_anggaran),
        kendala: payload.kendala || null,
        tindak_lanjut: payload.tindak_lanjut || null,
        link_bukti: linkBukti || null,
        bukti_tipe: buktiTipe || null,
        progress_semester_1: toNumber(payload.progress_semester_1),
        progress_semester_2: toNumber(payload.progress_semester_2),
        indikator: payload.indikator || null,
        output: payload.output || null,
        outcome: payload.outcome || null,
        nama_pejabat_penanggung_jawab: payload.nama_pejabat_penanggung_jawab || null,
        jabatan_penanggung_jawab: payload.jabatan_penanggung_jawab || null,
        nama_operator: payload.nama_operator || null,
        nomor_email_kontak: payload.nomor_email_kontak || null,
        perlu_review: toBoolean(payload.perlu_review) ?? existing?.perlu_review ?? true,
      }

      if (existing) {
        await existing.update({ ...values, updated_at: new Date() }, { transaction })
        const record = await existing.reload({ transaction })
        return serializeLaporanMonev(record)
      }

      const now = new Date()
      const record = await LaporanMonev.create(
        {
          laporan_monev_id: await nextId(LaporanMonev, 'laporan_monev_id', transaction),
          created_at: now,
          updated_at: now,
          ...values,
        },
        { transaction }
      )
      return serializeLaporanMonev(record)
    })

    await this.notifyMonevSaved(record, actor)
    return record
  }

  async getDownload(laporanMonevId: string | number) {
    const laporan = await LaporanMonev.findByPk(laporanMonevId)
    if (!laporan || !laporan.link_bukti) {
      throw new ErrorResponse.NotFound('Bukti dukung tidak ditemukan.')
    }

    const response = await fetch(laporan.link_bukti)
    if (!response.ok || !response.body) {
      throw new ErrorResponse.BadRequest('Bukti dukung gagal diunduh.')
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const rawFilename =
      laporan.link_bukti.split('?')[0].split('/').pop() || `bukti-monev-${laporanMonevId}`
    const filename = decodeURIComponent(rawFilename)

    return { response, contentType, filename }
  }

  async contributors() {
    const rows = await LaporanMonev.findAll({
      include: [
        {
          model: KegiatanPelaksana,
          include: [{ model: Pelaksana }],
        },
      ],
      order: [['created_at', 'desc']],
    })

    return rows
      .filter((row) =>
        Boolean(
          row.nama_pejabat_penanggung_jawab ||
            row.jabatan_penanggung_jawab ||
            row.nama_operator ||
            row.nomor_email_kontak
        )
      )
      .map((row) => ({
        laporan_monev_id: row.laporan_monev_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        kegiatan_pelaksana_id: row.kegiatan_pelaksana_id,
        instansi_pelaksana:
          row.kegiatanPelaksana?.pelaksana?.nama_pelaksana ?? row.konfirmasi_satker ?? null,
        nama_pejabat_penanggung_jawab: row.nama_pejabat_penanggung_jawab ?? null,
        jabatan_penanggung_jawab: row.jabatan_penanggung_jawab ?? null,
        nama_operator: row.nama_operator ?? null,
        nomor_email_kontak: row.nomor_email_kontak ?? null,
        link_bukti: row.link_bukti ?? null,
        bukti_tipe: row.bukti_tipe ?? null,
      }))
  }
}
