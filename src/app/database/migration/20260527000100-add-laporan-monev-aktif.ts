import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  const table = await queryInterface.describeTable('laporan_monev')

  if (!table.aktif) {
    await queryInterface.addColumn('laporan_monev', 'aktif', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    })
  }

  await queryInterface.sequelize.query('UPDATE laporan_monev SET aktif = TRUE WHERE aktif IS NULL')
}

export async function down(queryInterface: QueryInterface) {
  const table = await queryInterface.describeTable('laporan_monev')

  if (table.aktif) {
    await queryInterface.removeColumn('laporan_monev', 'aktif')
  }
}
