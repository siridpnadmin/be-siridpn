import { z } from 'zod'
import BaseSchema from '../entity/base'

export const userDpnAccessSchema = z.object({
  user_id: z.uuid({ message: 'user_id must be a valid UUID' }),
  dpn_code: z
    .string('dpn_code is required')
    .min(1, { message: 'dpn_code cannot be empty' })
    .max(50, { message: 'dpn_code must be at most 50 characters long' }),
})

export type UserDpnAccessSchema = z.infer<typeof userDpnAccessSchema> & Partial<BaseSchema>
