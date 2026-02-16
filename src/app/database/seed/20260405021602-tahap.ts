'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { ConstYear } from '~/lib/constant/seed/year'
import { v4 as uuidv4 } from 'uuid'

const tahapNames = ['Tahap Pertama', 'Tahap Kedua', 'Tahap Ketiga', 'Tahap Keempat', 'Tahap Kelima']

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const formData = []

  let tahapIndex = 0
  for (let startYear = 2020; startYear <= 2100 && tahapIndex < 5; startYear += 5) {
    const endYear = Math.min(startYear + 4, 2100)

    formData.push({
      id: uuidv4(),
      nama: tahapNames[tahapIndex],
      tahun_mulai_id: ConstYear[`ID_${startYear}` as keyof typeof ConstYear],
      tahun_selesai_id: ConstYear[`ID_${endYear}` as keyof typeof ConstYear],
      created_at: new Date(),
      updated_at: new Date(),
    })

    tahapIndex++
  }

  await queryInterface.bulkInsert('tahap', formData)
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('tahap', {})
}
