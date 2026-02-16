'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { ConstYear } from '~/lib/constant/seed/year'

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const formData = []

  for (let year = 2020; year <= 2100; year++) {
    const key = `ID_${year}` as keyof typeof ConstYear
    formData.push({
      id: ConstYear[key],
      tahun: year,
      created_at: new Date(),
      updated_at: new Date(),
    })
  }

  await queryInterface.bulkInsert('tahun', formData)
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('tahun', {})
}
