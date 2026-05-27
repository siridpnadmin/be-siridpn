import { unlink } from 'fs/promises'
import { Op } from 'sequelize'
import { storage } from '~/config/storage'
import { storageExists } from '~/lib/boolean'
import ErrorResponse from '~/lib/http/errors'
import Dpn from '../database/entity/dpn'
import ManagementReport from '../database/entity/management-report'
import Stakeholder from '../database/entity/stakeholder'
import StakeholderDpn from '../database/entity/stakeholder-dpn'
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

type StakeholderPayload = {
  dpn_id?: string | number | null
  name?: string | null
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

  private async ensureStakeholder(payload: StakeholderPayload) {
    const dpnId = asNumber(payload.dpn_id)
    const stakeholderName = cleanText(payload.name)

    if (!dpnId) throw new ErrorResponse.BadRequest('DPN wajib dipilih.')
    if (!stakeholderName) throw new ErrorResponse.BadRequest('Kelompok kerja wajib diisi.')

    const dpn = await Dpn.findByPk(dpnId)
    if (!dpn) throw new ErrorResponse.NotFound('DPN tidak ditemukan.')

    let stakeholder = await Stakeholder.findOne({
      where: { name: { [Op.iLike]: stakeholderName } },
    })

    if (!stakeholder) {
      const nextStakeholderId = Number((await Stakeholder.max('stakeholder_id')) || 0) + 1
      stakeholder = await Stakeholder.create({
        stakeholder_id: nextStakeholderId,
        name: stakeholderName,
        type: null,
      })
    }

    const stakeholderId = Number(stakeholder.stakeholder_id)
    const existingAccess = await StakeholderDpn.findOne({
      where: { stakeholder_id: stakeholderId, dpn_id: dpnId },
    })

    if (!existingAccess) {
      await StakeholderDpn.create({
        stakeholder_id: stakeholderId,
        dpn_id: dpnId,
      })
    }

    return {
      stakeholder_id: stakeholderId,
      name: cleanText(stakeholder.name) || stakeholderName,
      pelaksana_id: stakeholderId,
      nama_pelaksana: cleanText(stakeholder.name) || stakeholderName,
    }
  }

  async createStakeholderOption(payload: StakeholderPayload) {
    return this.ensureStakeholder(payload)
  }

  async save(payload: ReportPayload, file?: Express.Multer.File, id?: string | number, actor?: CurrentUser | null) {
    const dpnId = asNumber(payload.dpn_id)
    const tahap = asNumber(payload.tahap)
    const tahun = asNumber(payload.tahun)
    const namaFile = cleanText(payload.nama_file)
    let kelompokKerja = cleanText(payload.kelompok_kerja)
    let stakeholderId = asNumber(payload.pelaksana_id)

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

    if (stakeholderId) {
      const stakeholder = await Stakeholder.findByPk(stakeholderId)
      if (!stakeholder) throw new ErrorResponse.NotFound('Perangkat tidak ditemukan.')
      const stakeholderName = cleanText(stakeholder.name)
      if (stakeholderName) {
        kelompokKerja = stakeholderName
      }

      const existingAccess = await StakeholderDpn.findOne({
        where: { stakeholder_id: stakeholderId, dpn_id: dpnId },
      })
      if (!existingAccess) {
        await StakeholderDpn.create({
          stakeholder_id: stakeholderId,
          dpn_id: dpnId,
        })
      }
    } else {
      const stakeholderOption = await this.ensureStakeholder({
        dpn_id: dpnId,
        name: kelompokKerja,
      })
      stakeholderId = Number(stakeholderOption.stakeholder_id)
      kelompokKerja = stakeholderOption.name
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
      pelaksana_id: stakeholderId,
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

  async stakeholderOptions() {
    const rows = await Stakeholder.findAll({
      attributes: ['stakeholder_id', 'name'],
      order: [['name', 'asc']],
    })

    return rows.map((row) => {
      const values = row.get()
      return {
        stakeholder_id: values.stakeholder_id,
        name: values.name,
        pelaksana_id: values.stakeholder_id,
        nama_pelaksana: values.name,
      }
    })
  }

  async pelaksanaOptions() {
    return this.stakeholderOptions()
  }
}
