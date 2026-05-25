import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  const table = await queryInterface.describeTable('laporan_monev')

  if (!table.updated_at) {
    await queryInterface.addColumn('laporan_monev', 'updated_at', {
      type: DataTypes.DATE,
      allowNull: true,
    })
  }

  await queryInterface.sequelize.query('UPDATE laporan_monev SET updated_at = created_at WHERE updated_at IS NULL')
}

export async function down(queryInterface: QueryInterface) {
  const table = await queryInterface.describeTable('laporan_monev')

  if (table.updated_at) {
    await queryInterface.removeColumn('laporan_monev', 'updated_at')
  }
}
