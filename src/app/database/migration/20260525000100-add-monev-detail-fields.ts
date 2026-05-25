import type { QueryInterface } from 'sequelize'
import { DataTypes } from 'sequelize'

const columns = {
  bukti_tipe: { type: DataTypes.STRING(20), allowNull: true },
  progress_semester_1: { type: DataTypes.DOUBLE, allowNull: true },
  progress_semester_2: { type: DataTypes.DOUBLE, allowNull: true },
  indikator: { type: DataTypes.TEXT, allowNull: true },
  output: { type: DataTypes.TEXT, allowNull: true },
  outcome: { type: DataTypes.TEXT, allowNull: true },
} as const

export async function up(queryInterface: QueryInterface) {
  const table = await queryInterface.describeTable('laporan_monev')

  for (const [name, definition] of Object.entries(columns)) {
    if (!table[name]) {
      await queryInterface.addColumn('laporan_monev', name, definition)
    }
  }
}

export async function down(queryInterface: QueryInterface) {
  const table = await queryInterface.describeTable('laporan_monev')

  for (const name of Object.keys(columns).reverse()) {
    if (table[name]) {
      await queryInterface.removeColumn('laporan_monev', name)
    }
  }
}
