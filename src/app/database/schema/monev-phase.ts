import { z } from 'zod'
import BaseSchema from '../entity/base'

export const monevPhaseSchema = z.object({
  nama_fase: z.string('nama_fase is required').min(1).max(100),
  perpres: z.string('perpres is required').min(1).max(150),
  url_slug: z.string('url_slug is required').min(1).max(150),
  kode_akses: z.string('kode_akses is required').min(1).max(50),
  periode: z.string('periode is required').min(1).max(20),
  submisi: z.string().max(50).default('0 OPD'),
  status: z.enum(['aktif', 'nonaktif']).default('aktif'),
  tanggal_mulai: z.string('tanggal_mulai is required').min(1),
  tanggal_selesai: z.string('tanggal_selesai is required').min(1),
  jumlah_submisi: z.number().int().nonnegative().default(0),
  total_ra: z.number().int().nonnegative().default(0),
  perlu_review: z.number().int().nonnegative().default(0),
})

export type MonevPhaseSchema = z.infer<typeof monevPhaseSchema> & Partial<BaseSchema>
