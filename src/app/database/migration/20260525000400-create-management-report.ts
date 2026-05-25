import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  const tables = await queryInterface.showAllTables()
  if (tables.includes('management_report')) return

  await queryInterface.createTable('management_report', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    dpn_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    dpn_nama: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pelaksana_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    kelompok_kerja: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    nama_file: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tahap: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tahun: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    link_file: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    file_key: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    mime_type: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  })
}

export async function down(queryInterface: QueryInterface) {
  const tables = await queryInterface.showAllTables()
  if (tables.includes('management_report')) {
    await queryInterface.dropTable('management_report')
  }
}
