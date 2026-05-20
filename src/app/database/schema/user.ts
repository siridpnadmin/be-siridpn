import { z } from 'zod'
import BaseSchema from '../entity/base'

const passwordSchema = z.object({
  new_password: z.string().min(8, 'new password at least 8 characters'),
  confirm_new_password: z.string().min(8, 'confirm new password at least 8 characters'),
})

const userBaseSchema = z.object({
  fullname: z.string('fullname is required').min(2, "fullname can't be empty"),
  email: z.email({ message: 'invalid email address' }).min(2, "email can't be empty"),
  phone: z.string().max(20, 'phone must be at most 20 characters').nullable().optional(),
  token_verify: z.string().nullable().optional(),
  upload_id: z.uuid('upload_id invalid uuid format').nullable().optional(),
  is_active: z.boolean('is_active is required'),
  is_blocked: z.boolean('is_blocked is required'),
  role_id: z.uuid('role id invalid uuid format').min(2, `role id can't be empty`),
  dpn_accesses: z.array(z.string().min(1).max(50)).optional(),
})

export const createPasswordSchema = passwordSchema.refine(
  (data) => data.new_password === data.confirm_new_password,
  {
    message: "passwords don't match",
    path: ['confirm_new_password'],
  }
)

export const changePasswordSchema = passwordSchema
  .extend({
    current_password: z.string().min(8, 'current password at least 8 characters'),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "passwords don't match",
    path: ['confirm_new_password'],
  })

export const userSchema = userBaseSchema.merge(passwordSchema).refine(
  (data) => data.new_password === data.confirm_new_password,
  {
    message: "passwords don't match",
    path: ['confirm_new_password'],
  }
)

export const userUpdateSchema = userBaseSchema
  .merge(
    z.object({
      new_password: z.string().min(8, 'new password at least 8 characters').optional(),
      confirm_new_password: z
        .string()
        .min(8, 'confirm new password at least 8 characters')
        .optional(),
    })
  )
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "passwords don't match",
    path: ['confirm_new_password'],
  })

export const loginSchema = z.object({
  email: z.email('invalid email address').min(2, "email can't be empty"),
  password: z.string().min(2, "password can't be empty"),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
  ip_address: z.string().nullable().optional(),
  device: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  user_agent: z.string().nullable().optional(),
})

export type UserSchema = Omit<z.infer<typeof userSchema>, 'new_password' | 'confirm_new_password'> &
  Partial<BaseSchema> & {
    deleted_at: Date | null
  }

export type CreatePasswordSchema = z.infer<typeof passwordSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type UserLoginState = {
  uid: string
}
