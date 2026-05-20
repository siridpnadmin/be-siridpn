import { z } from 'zod'
import BaseSchema from '../entity/base'

export const ktaAreaSchema = z.object({
  dpn_id: z.uuid({ message: 'dpn_id must be a valid UUID' }),
  nama_kta: z.string('nama_kta is required').min(1).max(150),
  kabupaten_kota: z.array(z.string().min(1)).default([]),
  nomor_urut: z.number().int().positive().default(1),
})

export type KtaAreaSchema = z.infer<typeof ktaAreaSchema> & Partial<BaseSchema>
