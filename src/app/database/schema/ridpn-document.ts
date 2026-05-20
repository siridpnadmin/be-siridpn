import { z } from 'zod'
import BaseSchema from '../entity/base'

export const ridpnDocumentSchema = z.object({
  no_perpres: z.string('no_perpres is required').min(3).max(255),
  status: z.enum(['terbit', 'rancangan']).default('rancangan'),
  dpn_id: z.uuid({ message: 'dpn_id must be a valid UUID' }),
  tahap: z.string('tahap is required').min(1).max(50),
  link: z.string().nullable().optional(),
})

export type RidpnDocumentSchema = z.infer<typeof ridpnDocumentSchema> & Partial<BaseSchema>
