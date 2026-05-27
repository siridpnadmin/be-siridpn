import { DataTypes, QueryInterface } from 'sequelize'

const columns: Record<string, any> = {
  diubah_oleh: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  diubah_oleh_email: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}

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
