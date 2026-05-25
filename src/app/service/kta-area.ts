import { Op } from 'sequelize'
import ErrorResponse from '~/lib/http/errors'
import Dpn from '../database/entity/dpn'
import KtaArea from '../database/entity/kta-area'

function cleanText(value: unknown) {
  return String(value || '').trim()
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export default class KtaAreaService {
  async list({
    page = 1,
    pageSize = 1000,
    dpnId,
    search = '',
  }: {
    page?: number
    pageSize?: number
    dpnId?: string | number | null
    search?: string
  }) {
    const parsedDpnId = asNumber(dpnId)
    const normalizedSearch = cleanText(search)
    const where = {
      ...(parsedDpnId ? { dpn_id: parsedDpnId } : {}),
      ...(normalizedSearch
        ? {
            [Op.or]: [
              { nama_kta: { [Op.iLike]: `%${normalizedSearch}%` } },
              { '$dpn.nama_dpn$': { [Op.iLike]: `%${normalizedSearch}%` } },
              { '$dpn.kode$': { [Op.iLike]: `%${normalizedSearch}%` } },
            ],
          }
        : {}),
    }

    const { rows, count } = await KtaArea.findAndCountAll({
      where,
      include: [
        {
          model: Dpn,
          attributes: ['dpn_id', 'kode', 'nama_dpn', 'public_thumbnail'],
        },
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [
        ['dpn_id', 'asc'],
        ['nomor_urut', 'asc'],
        ['id', 'asc'],
      ],
    })

    return {
      data: rows.map((row) => row.get()),
      total: count,
    }
  }

  async listByDpn(dpnId: string | number) {
    const parsedDpnId = asNumber(dpnId)
    if (!parsedDpnId) throw new ErrorResponse.BadRequest('DPN wajib dipilih.')

    const dpn = await Dpn.findByPk(parsedDpnId)
    if (!dpn) throw new ErrorResponse.NotFound('DPN tidak ditemukan.')

    return this.list({ dpnId: parsedDpnId })
  }
}
