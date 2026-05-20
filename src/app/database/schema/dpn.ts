import { z } from 'zod'
import BaseSchema from '../entity/base'

export const dpnSchema = z.object({
  dpn_id: z.number().int().positive(),
  kode: z.string('kode is required').min(1).max(50),
  nama_dpn: z.string('nama_dpn is required').min(1).max(255),
  lat_pusat: z.number().nullable().optional(),
  long_pusat: z.number().nullable().optional(),
  public_thumbnail: z.string().nullable().optional(),
})

export type DpnSchema = z.infer<typeof dpnSchema> & Partial<BaseSchema>
