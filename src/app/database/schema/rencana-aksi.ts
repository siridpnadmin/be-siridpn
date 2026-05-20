import { z } from 'zod'
import BaseSchema from '../entity/base'

export const rencanaAksiSchema = z.object({
  ridpn_document_id: z.uuid({ message: 'ridpn_document_id must be a valid UUID' }),
  no_ra: z.string('no_ra is required').min(1).max(50),
  komponen: z.string('komponen is required').min(1).max(100),
  kegiatan: z.string('kegiatan is required').min(1),
  lokasi: z.string('lokasi is required').min(1).max(255),
  target: z.string('target is required').min(1).max(100),
  tahun: z.string('tahun is required').min(1).max(100),
  pelaksana: z.array(z.string()).default([]),
  status: z
    .enum(['terlaksana', 'sedang', 'belum', 'tidakDiketahui', 'belumDiisi'])
    .default('belumDiisi'),
})

export type RencanaAksiSchema = z.infer<typeof rencanaAksiSchema> & Partial<BaseSchema>
