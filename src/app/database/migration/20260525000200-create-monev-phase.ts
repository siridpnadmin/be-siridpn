import type { QueryInterface } from 'sequelize'
import { DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('monev_phase', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true,
    },
    nama_fase: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    perpres: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    url_slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    kode_akses: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    periode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    submisi: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: '0 OPD',
    },
    status: {
      type: DataTypes.ENUM('aktif', 'nonaktif'),
      allowNull: false,
      defaultValue: 'aktif',
    },
    tanggal_mulai: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tanggal_selesai: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    jumlah_submisi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_ra: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    perlu_review: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  })
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('monev_phase')
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_monev_phase_status";')
}
