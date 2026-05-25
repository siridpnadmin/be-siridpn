import { QueryInterface, DataTypes } from 'sequelize'

const columns: Record<string, any> = {
  nama_pejabat_penanggung_jawab: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  jabatan_penanggung_jawab: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nama_operator: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  nomor_email_kontak: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  perlu_review: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
