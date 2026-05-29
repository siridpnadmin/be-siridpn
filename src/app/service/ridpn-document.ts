import { Model, ModelStatic, Op } from 'sequelize'
import ErrorResponse from '~/lib/http/errors'
import { db } from '../database/connection'
import Dpn from '../database/entity/dpn'
import MonevPhase from '../database/entity/monev-phase'
import Perpres from '../database/entity/perpres'
import PerpresDpnTahap from '../database/entity/perpres-dpn-tahap'

type RidpnDocumentStatus = 'terbit' | 'rancangan' | 'dicabut'

type RidpnDocumentTargetPayload = {
  id?: string | number
  dpn_id: string | number
  tahap: string
}

type RidpnDocumentPayload = {
  no_perpres: string
  status: RidpnDocumentStatus
  link?: string | null
  targets: RidpnDocumentTargetPayload[]
}

function toBackendStatus(status: RidpnDocumentStatus) {
  if (status === 'terbit') return 'terpublikasi'
  if (status === 'dicabut') return 'dicabut'
  return 'draft'
}

function toRidpnDocumentStatus(status?: string | null): RidpnDocumentStatus {
  if (status === 'terpublikasi') return 'terbit'
  if (status === 'dicabut') return 'dicabut'
  return 'rancangan'
}

function normalizeTahap(tahap: string) {
  const trimmed = String(tahap || '').trim()
  return trimmed.toLowerCase().startsWith('tahap ') ? trimmed : `Tahap ${trimmed}`
}

function cleanTahapLabel(value?: string | null) {
  return String(value ?? '')
    .trim()
    .replace(/^tahap\s+/i, '')
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

function normalizeTargets(targets: RidpnDocumentTargetPayload[]) {
  const cleanTargets = targets
    .filter((target) => target.dpn_id && target.tahap)
    .map((target) => ({
      ...target,
      dpn_id: Number(target.dpn_id),
      tahap: normalizeTahap(target.tahap),
    }))

  if (!cleanTargets.length) {
    throw new ErrorResponse.BadRequest('Minimal satu DPP dan Tahap wajib dipilih')
  }

  const unique = new Set<string>()
  for (const target of cleanTargets) {
    const key = `${target.dpn_id}:${target.tahap.toLowerCase()}`
    if (unique.has(key)) {
      throw new ErrorResponse.BadRequest('DPP dan Tahap tidak boleh duplikat dalam satu dokumen')
    }
    unique.add(key)
  }

  return cleanTargets
}

async function nextId(model: ModelStatic<Model>, primaryKey: string, transaction: any) {
  const maxId = await model.max(primaryKey, { transaction })
  return Number(maxId || 0) + 1
}

export default class RidpnDocumentService {
  async list(page = 1, pageSize = 1000) {
    const limit = Math.max(1, Number(pageSize) || 1000)
    const offset = (Math.max(1, Number(page) || 1) - 1) * limit
    const { rows, count } = await PerpresDpnTahap.findAndCountAll({
      include: [{ model: Perpres }, { model: Dpn }],
      order: [
        ['perpres_id', 'asc'],
        ['perpres_dpn_tahap_id', 'asc'],
      ],
      limit,
      offset,
    })

    return {
      data: rows.map((row) => ({
        id: String(row.perpres_id),
        target_id: String(row.perpres_dpn_tahap_id),
        no_perpres: row.perpres?.no_perpres ?? '',
        status: toRidpnDocumentStatus(row.perpres?.status),
        dpn_id: String(row.dpn_id),
        tahap: row.tahap,
        link: row.perpres?.link ?? null,
        dpn: row.dpn
          ? {
              dpn_id: row.dpn.dpn_id,
              kode: row.dpn.kode,
              nama_dpn: row.dpn.nama_dpn,
              lat_pusat: row.dpn.lat_pusat,
              long_pusat: row.dpn.long_pusat,
              public_thumbnail: row.dpn.public_thumbnail,
            }
          : null,
      })),
      total: count,
    }
  }

  async save(payload: RidpnDocumentPayload, perpresId?: string | number) {
    const targets = normalizeTargets(payload.targets)
    const status = toBackendStatus(payload.status)

    return db.sequelize.transaction(async (transaction) => {
      let perpres = perpresId
        ? await Perpres.findByPk(perpresId, { transaction })
        : await Perpres.findOne({ where: { no_perpres: payload.no_perpres }, transaction })

      if (!perpres) {
        perpres = await Perpres.create(
          {
            perpres_id: await nextId(Perpres, 'perpres_id', transaction),
            no_perpres: payload.no_perpres,
            status,
            link: payload.link || null,
          },
          { transaction }
        )
      } else {
        const duplicate = await Perpres.findOne({
          where: {
            no_perpres: payload.no_perpres,
            perpres_id: { [Op.ne]: perpres.perpres_id },
          },
          transaction,
        })

        if (duplicate) {
          throw new ErrorResponse.BadRequest('No. Perpres/Draft sudah digunakan dokumen lain')
        }

        await perpres.update(
          {
            no_perpres: payload.no_perpres,
            status,
            link: payload.link || null,
          },
          { transaction }
        )
      }

      const existingTargets = await PerpresDpnTahap.findAll({
        where: { perpres_id: perpres.perpres_id },
        transaction,
        order: [['perpres_dpn_tahap_id', 'asc']],
      })

      const usedIds = new Set<number>()

      for (const target of targets) {
        const targetId = target.id ? Number(target.id) : undefined
        const existing =
          (targetId
            ? existingTargets.find((item) => Number(item.perpres_dpn_tahap_id) === targetId)
            : undefined) ||
          existingTargets.find(
            (item) =>
              !usedIds.has(Number(item.perpres_dpn_tahap_id)) &&
              Number(item.dpn_id) === Number(target.dpn_id) &&
              String(item.tahap).toLowerCase() === target.tahap.toLowerCase()
          )

        if (existing) {
          await existing.update(
            {
              dpn_id: target.dpn_id,
              tahap: target.tahap,
              status,
            },
            { transaction }
          )
          usedIds.add(Number(existing.perpres_dpn_tahap_id))
          continue
        }

        const created = await PerpresDpnTahap.create(
          {
            perpres_dpn_tahap_id: await nextId(
              PerpresDpnTahap,
              'perpres_dpn_tahap_id',
              transaction
            ),
            perpres_id: perpres.perpres_id,
            dpn_id: target.dpn_id,
            tahap: target.tahap,
            status,
            tanggal_penetapan: null,
            catatan: null,
          },
          { transaction }
        )
        usedIds.add(Number(created.perpres_dpn_tahap_id))
      }

      const unusedTargets = existingTargets.filter(
        (item) => !usedIds.has(Number(item.perpres_dpn_tahap_id))
      )

      if (unusedTargets.length) {
        await PerpresDpnTahap.destroy({
          where: {
            perpres_dpn_tahap_id: unusedTargets.map((item) => item.perpres_dpn_tahap_id),
          },
          transaction,
        })
      }

      const savedTargets = await PerpresDpnTahap.findAll({
        where: { perpres_id: perpres.perpres_id },
        transaction,
        include: [{ model: Perpres }, { model: Dpn }],
        order: [['perpres_dpn_tahap_id', 'asc']],
      })

      if (status === 'dicabut') {
        const revokedLabels = savedTargets.map(documentLabel).filter(Boolean)
        if (revokedLabels.length) {
          await MonevPhase.update(
            { status: 'nonaktif', updated_at: new Date() },
            {
              where: {
                deleted_at: null,
                perpres: { [Op.in]: revokedLabels },
              },
              transaction,
            }
          )
        }
      }

      return { perpres, targets: savedTargets }
    })
  }

  async delete(perpresId: string | number) {
    return db.sequelize.transaction(async (transaction) => {
      await PerpresDpnTahap.destroy({ where: { perpres_id: perpresId }, transaction })
      const deleted = await Perpres.destroy({ where: { perpres_id: perpresId }, transaction })

      if (!deleted) {
        throw new ErrorResponse.NotFound('RIDPN document not found')
      }
    })
  }
}
