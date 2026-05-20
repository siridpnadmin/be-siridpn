'use strict'

import { green } from 'colorette'
import _ from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { env } from '~/config/env'
import Hashing from '~/config/hashing'
import { logger } from '~/config/logger'
import { ConstRole } from '~/lib/constant/seed/role'

const hashing = new Hashing()

const defaultPassword = env.APP_DEFAULT_PASS
logger.info(`Seed - your default password: ${green(defaultPassword)}`)

const data = [
  {
    fullname: 'Super Admin',
    email: 'superadmin@siridpn.go.id',
    role_id: ConstRole.ID_SUPER_ADMIN,
  },
  {
    fullname: 'Manager Admin',
    email: 'manageradmin@siridpn.go.id',
    role_id: ConstRole.ID_MANAGER_ADMIN,
  },
  {
    fullname: 'Local Admin',
    email: 'admin@siridpn.go.id',
    role_id: ConstRole.ID_LOCAL_ADMIN,
  },
  {
    fullname: 'Contributor',
    email: 'contributor@siridpn.go.id',
    role_id: ConstRole.ID_CONTRIBUTOR,
  },
  {
    fullname: 'Executive',
    email: 'executive@siridpn.go.id',
    role_id: ConstRole.ID_EXCECUTIVE,
  },
  {
    fullname: 'Public',
    email: 'public@siridpn.go.id',
    role_id: ConstRole.ID_PUBLIC,
  },
]

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const password = await hashing.hash(defaultPassword)
  const formData: any[] = []

  if (!_.isEmpty(data)) {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i]

      formData.push({
        ...item,
        id: uuidv4(),
        is_active: true,
        is_blocked: false,
        password,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }
  }

  await queryInterface.bulkInsert('user', formData)
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('user', {})
}
