import { z } from 'zod'
import BaseSchema from '../entity/base'

// Schema
export const tahapSchema = z.object({
  nama: z.string('nama is required').min(2, "nama can't be empty"),
  tahun_mulai_id: z
    .uuid('tahun_mulai_id id invalid uuid format')
    .min(2, `tahun_mulai_id id can't be empty`),
  tahun_selesai_id: z
    .uuid('tahun_selesai_id id invalid uuid format')
    .min(2, `tahun_selesai_id id can't be empty`),
})

// Type
export type TahapSchema = z.infer<typeof tahapSchema> &
  BaseSchema & {
    deleted_at: Date | null
  }
