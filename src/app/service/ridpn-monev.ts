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
  aktif?: string | boolean | number | null
  diubah_oleh?: string | null
  diubah_oleh_email?: string | null
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

function hasPayloadField(payload: MonevPayload, key: keyof MonevPayload) {
  return Object.prototype.hasOwnProperty.call(payload, key)
}

function serializeLaporanMonev(laporan: LaporanMonev) {
  const values = laporan.get({ plain: true })

  return {
    ...values,
    created_at: values.created_at ?? null,
    updated_at: values.updated_at ?? values.created_at ?? null,
  }
}

function compareLaporanByCreatedDesc(left: LaporanMonev, right: LaporanMonev) {
  const leftTime = new Date(left.created_at).getTime()
  const rightTime = new Date(right.created_at).getTime()
  if (leftTime !== rightTime) return rightTime - leftTime
  return Number(right.laporan_monev_id) - Number(left.laporan_monev_id)
}

export default class RidpnMonevService {
  private notificationService = new NotificationService()

  private async deactivateSiblingSnapshots(
    kegiatanPelaksanaId: number,
    activeLaporanMonevId: number,
    transaction: any
  ) {
    await LaporanMonev.update(
      { aktif: false },
      {
        where: {
          kegiatan_pelaksana_id: kegiatanPelaksanaId,
          laporan_monev_id: { [Op.ne]: activeLaporanMonevId },
        },
        transaction,
      }
    )
  }

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
        .sort(compareLaporanByCreatedDesc)
        .slice(0, 5)
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
        : null

      if (targetId && !existing) {
        throw new ErrorResponse.NotFound('Laporan monev tidak ditemukan.')
      }

      const kegiatanPelaksanaId = Number(payload.kegiatan_pelaksana_id)
      const payloadAktif = toBoolean(payload.aktif)
      const payloadPerluReview = toBoolean(payload.perlu_review)
      const nextLinkBukti = file || hasPayloadField(payload, 'link_bukti') ? linkBukti || null : existing?.link_bukti ?? null
      const nextBuktiTipe = file || hasPayloadField(payload, 'bukti_tipe') ? buktiTipe || null : existing?.bukti_tipe ?? null
      const actorName =
        String(payload.diubah_oleh ?? '').trim() ||
        actor?.name ||
        actor?.email ||
        payload.nama_operator ||
        payload.nama_pejabat_penanggung_jawab ||
        null
      const actorEmail =
        String(payload.diubah_oleh_email ?? '').trim() ||
        actor?.email ||
        null

      const values = {
        kegiatan_pelaksana_id: kegiatanPelaksanaId,
        status_kegiatan: hasPayloadField(payload, 'status_kegiatan')
          ? normalizeStatus(payload.status_kegiatan)
          : existing?.status_kegiatan ?? 'belum dikonfirmasi',
        konfirmasi_satker: hasPayloadField(payload, 'konfirmasi_satker')
          ? payload.konfirmasi_satker || null
          : existing?.konfirmasi_satker ?? null,
        uraian_keterangan: hasPayloadField(payload, 'uraian_keterangan')
          ? payload.uraian_keterangan || null
          : existing?.uraian_keterangan ?? null,
        pagu_anggaran: hasPayloadField(payload, 'pagu_anggaran')
          ? toNumber(payload.pagu_anggaran)
          : existing?.pagu_anggaran ?? null,
        realisasi_anggaran: hasPayloadField(payload, 'realisasi_anggaran')
          ? toNumber(payload.realisasi_anggaran)
          : existing?.realisasi_anggaran ?? null,
        kendala: hasPayloadField(payload, 'kendala') ? payload.kendala || null : existing?.kendala ?? null,
        tindak_lanjut: hasPayloadField(payload, 'tindak_lanjut')
          ? payload.tindak_lanjut || null
          : existing?.tindak_lanjut ?? null,
        link_bukti: nextLinkBukti,
        bukti_tipe: nextBuktiTipe,
        progress_semester_1: hasPayloadField(payload, 'progress_semester_1')
          ? toNumber(payload.progress_semester_1)
          : existing?.progress_semester_1 ?? null,
        progress_semester_2: hasPayloadField(payload, 'progress_semester_2')
          ? toNumber(payload.progress_semester_2)
          : existing?.progress_semester_2 ?? null,
        indikator: hasPayloadField(payload, 'indikator') ? payload.indikator || null : existing?.indikator ?? null,
        output: hasPayloadField(payload, 'output') ? payload.output || null : existing?.output ?? null,
        outcome: hasPayloadField(payload, 'outcome') ? payload.outcome || null : existing?.outcome ?? null,
        nama_pejabat_penanggung_jawab: hasPayloadField(payload, 'nama_pejabat_penanggung_jawab')
          ? payload.nama_pejabat_penanggung_jawab || null
          : existing?.nama_pejabat_penanggung_jawab ?? null,
        jabatan_penanggung_jawab: hasPayloadField(payload, 'jabatan_penanggung_jawab')
          ? payload.jabatan_penanggung_jawab || null
          : existing?.jabatan_penanggung_jawab ?? null,
        nama_operator: hasPayloadField(payload, 'nama_operator')
          ? payload.nama_operator || null
          : existing?.nama_operator ?? null,
        nomor_email_kontak: hasPayloadField(payload, 'nomor_email_kontak')
          ? payload.nomor_email_kontak || null
          : existing?.nomor_email_kontak ?? null,
        perlu_review: payloadPerluReview ?? existing?.perlu_review ?? true,
        aktif: payloadAktif ?? existing?.aktif ?? true,
        diubah_oleh: hasPayloadField(payload, 'diubah_oleh') || !existing ? actorName : existing?.diubah_oleh ?? actorName,
        diubah_oleh_email: hasPayloadField(payload, 'diubah_oleh_email') || !existing ? actorEmail : existing?.diubah_oleh_email ?? actorEmail,
      }

      if (existing) {
        await existing.update({ ...values, updated_at: new Date() }, { transaction })
        if (values.aktif) {
          await this.deactivateSiblingSnapshots(kegiatanPelaksanaId, Number(existing.laporan_monev_id), transaction)
        }
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
      if (record.aktif) {
        await this.deactivateSiblingSnapshots(kegiatanPelaksanaId, Number(record.laporan_monev_id), transaction)
      }
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

  async contributors(user?: CurrentUser | null) {
    const rows = await LaporanMonev.findAll({
      include: [
        {
          model: KegiatanPelaksana,
          include: [
            { model: Pelaksana },
            {
              model: Kegiatan,
              include: [{ model: PerpresDpnTahap }],
            },
          ],
        },
      ],
      order: [['created_at', 'desc']],
    })

    const records = rows
      .filter((row) =>
        Boolean(
          row.nama_pejabat_penanggung_jawab ||
            row.jabatan_penanggung_jawab ||
            row.nama_operator ||
            row.nomor_email_kontak
        )
      )
      .map((row) => {
        const document = row.kegiatanPelaksana?.kegiatan?.perpresDpnTahap
        return {
          laporan_monev_id: row.laporan_monev_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          kegiatan_pelaksana_id: row.kegiatan_pelaksana_id,
          perpres_dpn_tahap_id: document?.perpres_dpn_tahap_id ?? null,
          dpn_id: document?.dpn_id ?? null,
          instansi_pelaksana:
            row.kegiatanPelaksana?.pelaksana?.nama_pelaksana ?? row.konfirmasi_satker ?? null,
          nama_pejabat_penanggung_jawab: row.nama_pejabat_penanggung_jawab ?? null,
          jabatan_penanggung_jawab: row.jabatan_penanggung_jawab ?? null,
          nama_operator: row.nama_operator ?? null,
          nomor_email_kontak: row.nomor_email_kontak ?? null,
          link_bukti: row.link_bukti ?? null,
          bukti_tipe: row.bukti_tipe ?? null,
        }
      })

    if (user?.role_code === 'local_admin') {
      const allowedDpnIds = new Set((user.dpn_access ?? []).map((access) => String(access.dpn_id)))
      return records.filter((record) => record.dpn_id !== null && allowedDpnIds.has(String(record.dpn_id)))
    }

    return records
  }
}
