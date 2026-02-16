'use strict'

import { isEmpty } from 'lodash'
import { DataTypes, QueryInterface } from 'sequelize'
import { ConstRole } from '~/lib/constant/seed/role'

const data = [
  {
    id: ConstRole.ID_SUPER_ADMIN,
    name: 'Super Admin',
  },
  {
    id: ConstRole.ID_MANAGER_ADMIN,
    name: 'Manager Admin',
  },
  {
    id: ConstRole.ID_LOCAL_ADMIN,
    name: 'Local Admin',
  },
  {
    id: ConstRole.ID_CONTRIBUTOR,
    name: 'Contributor',
  },
  {
    id: ConstRole.ID_EXCECUTIVE,
    name: 'Executive',
  },
  {
    id: ConstRole.ID_PUBLIC,
    name: 'Public',
  },
]

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const formData: any[] = []

  if (!isEmpty(data)) {
    for (let i = 0; i < data.length; i += 1) {
      const item = data[i]

      formData.push({
        ...item,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }
  }

  await queryInterface.bulkInsert('role', formData)
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('role', {})
}
