'use strict'

import argon2 from 'argon2'
import { DataTypes, QueryInterface } from 'sequelize'

const roles = [
  {
    code: 'super_admin',
    name: 'Super Admin',
    manageable: true,
    description:
      'Administrator level tertinggi dengan akses penuh ke data internal dan manajemen pengguna.',
  },
  {
    code: 'manager_admin',
    name: 'Manager Admin',
    manageable: true,
    description:
      'Administrator pengelola data kegiatan, periode pemantauan evaluasi, dan pembaruan status rencana aksi.',
  },
  {
    code: 'local_admin',
    name: 'Local Admin',
    manageable: true,
    description:
      'Administrator tingkat lokal/regional untuk DPN yang ditugaskan.',
  },
  {
    code: 'contributor',
    name: 'Contributor',
    manageable: false,
    description:
      'Pihak eksternal yang mengisi data melalui akses URL unik dan kode masuk universal.',
  },
  {
    code: 'executive',
    name: 'Executive',
    manageable: true,
    description:
      'Pemangku kepentingan strategis yang memantau kinerja dan hasil pemantauan evaluasi.',
  },
]

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const now = new Date()
  const defaultPassword = process.env.APP_DEFAULT_PASS || 'yourpassword'
  const password = await argon2.hash(defaultPassword)

  for (const role of roles) {
    await queryInterface.sequelize.query(
      `
        INSERT INTO roles (code, name, description, manageable)
        VALUES (:code, :name, :description, :manageable)
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          manageable = EXCLUDED.manageable
      `,
      { replacements: role }
    )
  }

  await queryInterface.sequelize.query(
    `
      INSERT INTO users (id, name, email, password, role_code, created_at, updated_at)
      VALUES (gen_random_uuid(), :name, :email, :password, :roleCode, :now, :now)
      ON CONFLICT (email) DO NOTHING
    `,
    {
      replacements: {
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@kemenpar.go.id',
        password,
        roleCode: 'super_admin',
        now,
      },
    }
  )
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('users', {
    email: [process.env.SUPER_ADMIN_EMAIL || 'superadmin@kemenpar.go.id'],
  })
  await queryInterface.bulkDelete('roles', {
    code: roles.map((role) => role.code),
  })
}
