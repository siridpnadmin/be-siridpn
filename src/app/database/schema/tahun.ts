import { z } from 'zod'
import BaseSchema from '../entity/base'

// Schema
export const tahunSchema = z.object({
  tahun: z
    .number('tahun is required')
    .int('tahun must be an integer')
    .min(2020, { message: 'tahun must be at least 2020' })
    .max(2100, { message: 'tahun must be at most 2100' }),
})

// Type
export type TahunSchema = z.infer<typeof tahunSchema> &
  BaseSchema & {
    deleted_at: Date | null
  }
