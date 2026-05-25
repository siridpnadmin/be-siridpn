import { unlink } from 'fs/promises'
import { Op } from 'sequelize'
import { storage } from '~/config/storage'
import { storageExists } from '~/lib/boolean'
import ErrorResponse from '~/lib/http/errors'
import Dpn from '../database/entity/dpn'
import JenisPelaksana from '../database/entity/jenis-pelaksana'
import ManagementReport from '../database/entity/management-report'
import Pelaksana from '../database/entity/pelaksana'
import NotificationService, { type CurrentUser } from './notification'

type ReportPayload = {
  dpn_id?: string | number | null
  pelaksana_id?: string | number | null
  kelompok_kerja?: string | null
  nama_file?: string | null
  tahap?: string | number | null
  tahun?: string | number | null
  keterangan?: string | null
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function cleanText(value: unknown) {
  return String(value || '').trim()
}

export default class ManagementReportService {
  private notificationService = new NotificationService()

  async list({ search = '', page = 1, pageSize = 5000 }: { search?: string; page?: number; pageSize?: number }) {
    const where = cleanText(search)
      ? {
          [Op.or]: [
            { dpn_nama: { [Op.iLike]: `%${cleanText(search)}%` } },
            { kelompok_kerja: { [Op.iLike]: `%${cleanText(search)}%` } },
            { nama_file: { [Op.iLike]: `%${cleanText(search)}%` } },
          ],
        }
      : undefined

    const { rows, count } = await ManagementReport.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [
        ['created_at', 'desc'],
        ['id', 'desc'],
      ],
    })

    return {
      data: rows.map((row) => row.get()),
      total: count,
    }
  }

  private async notifyReportChanged(action: 'created' | 'updated' | 'deleted', record: Record<string, any>, actor?: CurrentUser | null) {
    if (!actor) return

    const actionLabel = action === 'created' ? 'diupload' : action === 'updated' ? 'diperbarui' : 'dihapus'

    await this.notificationService.createForRoles(['super_admin', 'manager_admin'], {
      actor_user_id: actor.id,
      type: action === 'deleted' ? 'warning' : 'info',
      category: 'management-report',
      title: `File pelaporan ${actionLabel}`,
      message: `${actor.name || actor.email || 'User'} ${actionLabel} file "${record.nama_file}" untuk ${record.dpn_nama} Tahap ${record.tahap}.`,
      link: '/admin/management-report',
      metadata: {
        management_report_id: record.id,
        dpn_id: record.dpn_id,
        dpn_nama: record.dpn_nama,
        kelompok_kerja: record.kelompok_kerja,
        nama_file: record.nama_file,
        tahap: record.tahap,
        action,
      },
    })
  }

  async save(payload: ReportPayload, file?: Express.Multer.File, id?: string | number, actor?: CurrentUser | null) {
    const dpnId = asNumber(payload.dpn_id)
    const tahap = asNumber(payload.tahap)
    const tahun = asNumber(payload.tahun)
    const namaFile = cleanText(payload.nama_file)
    const kelompokKerja = cleanText(payload.kelompok_kerja)
    let pelaksanaId = asNumber(payload.pelaksana_id)

    if (!dpnId) throw new ErrorResponse.BadRequest('DPN wajib dipilih.')
    if (!kelompokKerja) throw new ErrorResponse.BadRequest('Kelompok kerja wajib diisi.')
    if (!namaFile) throw new ErrorResponse.BadRequest('Nama file wajib diisi.')
    if (!tahap || tahap < 1 || tahap > 5) throw new ErrorResponse.BadRequest('Tahap harus bernilai 1 sampai 5.')

    const existing = id ? await ManagementReport.findByPk(id) : null
    if (!file && !existing) {
      throw new ErrorResponse.BadRequest('File PDF wajib diunggah.')
    }

    const dpn = await Dpn.findByPk(dpnId)
    if (!dpn) throw new ErrorResponse.NotFound('DPN tidak ditemukan.')

    if (!pelaksanaId) {
      const existingPelaksana = await Pelaksana.findOne({
        where: { nama_pelaksana: { [Op.iLike]: kelompokKerja } },
      })
      if (existingPelaksana) {
        pelaksanaId = Number(existingPelaksana.pelaksana_id)
      } else {
        const jenisPelaksana = await JenisPelaksana.findOne({ order: [['jenis_pelaksana_id', 'asc']] })
        const nextPelaksanaId = Number((await Pelaksana.max('pelaksana_id')) || 0) + 1
        const createdPelaksana = await Pelaksana.create({
          pelaksana_id: nextPelaksanaId,
          jenis_pelaksana_id: Number(jenisPelaksana?.jenis_pelaksana_id || 1),
          nama_pelaksana: kelompokKerja,
          catatan: 'Ditambahkan dari Manajemen Pelaporan',
        })
        pelaksanaId = Number(createdPelaksana.pelaksana_id)
      }
    }

    let linkFile = existing?.link_file || ''
    let fileName = existing?.file_name || ''
    let fileKey = existing?.file_key || null
    let fileSize = existing?.file_size || null
    let mimeType = existing?.mime_type || null

    if (file) {
      if (!storageExists()) {
        throw new ErrorResponse.BadRequest('Storage MinIO belum dikonfigurasi.')
      }
      const upload = await storage.uploadFile({
        directory: 'pelaporan',
        file,
      })
      linkFile = upload.signedUrl
      fileName = file.originalname || file.filename
      fileKey = `pelaporan/${file.filename}`
      fileSize = file.size
      mimeType = file.mimetype
      await unlink(file.path).catch(() => undefined)
    }

    const values = {
      dpn_id: dpnId,
      dpn_nama: dpn.nama_dpn,
      pelaksana_id: pelaksanaId,
      kelompok_kerja: kelompokKerja,
      nama_file: namaFile,
      tahap,
      tahun,
      keterangan: cleanText(payload.keterangan) || null,
      link_file: linkFile,
      file_name: fileName,
      file_key: fileKey,
      file_size: fileSize,
      mime_type: mimeType,
    }

    if (existing) {
      await existing.update(values)
      const record = await existing.reload()
      await this.notifyReportChanged('updated', record.get({ plain: true }), actor)
      return record
    }

    const record = await ManagementReport.create(values)
    await this.notifyReportChanged('created', record.get({ plain: true }), actor)
    return record
  }

  async remove(id: string | number, actor?: CurrentUser | null) {
    const row = await ManagementReport.findByPk(id)
    if (!row) throw new ErrorResponse.NotFound('File pelaporan tidak ditemukan.')
    const record = row.get({ plain: true })
    await row.destroy()
    await this.notifyReportChanged('deleted', record, actor)
  }

  async getDownload(id: string | number) {
    const row = await ManagementReport.findByPk(id)
    if (!row || !row.link_file) {
      throw new ErrorResponse.NotFound('File pelaporan tidak ditemukan.')
    }

    const response = await fetch(row.link_file)
    if (!response.ok || !response.body) {
      throw new ErrorResponse.BadRequest('File pelaporan gagal diunduh.')
    }

    return {
      response,
      contentType: row.mime_type || response.headers.get('content-type') || 'application/pdf',
      filename: row.file_name || `laporan-${id}.pdf`,
    }
  }

  async pelaksanaOptions() {
    const rows = await Pelaksana.findAll({
      attributes: ['pelaksana_id', 'nama_pelaksana'],
      order: [['nama_pelaksana', 'asc']],
    })

    return rows.map((row) => row.get())
  }
}
