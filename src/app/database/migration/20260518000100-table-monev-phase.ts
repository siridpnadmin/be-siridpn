'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('monev_phase', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    deleted_at: {
      allowNull: true,
      type: Sequelize.DATE,
    },
    nama_fase: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    perpres: {
      allowNull: false,
      type: Sequelize.STRING(150),
    },
    url_slug: {
      allowNull: false,
      type: Sequelize.STRING(150),
      unique: true,
    },
    kode_akses: {
      allowNull: false,
      type: Sequelize.STRING(50),
      unique: true,
    },
    periode: {
      allowNull: false,
      type: Sequelize.STRING(20),
    },
    submisi: {
      allowNull: false,
      type: Sequelize.STRING(50),
      defaultValue: '0 OPD',
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('aktif', 'nonaktif'),
      defaultValue: 'aktif',
    },
    tanggal_mulai: {
      allowNull: false,
      type: Sequelize.DATEONLY,
    },
    tanggal_selesai: {
      allowNull: false,
      type: Sequelize.DATEONLY,
    },
    jumlah_submisi: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    total_ra: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perlu_review: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  })

  await queryInterface.addIndex('monev_phase', ['status'])
  await queryInterface.addIndex('monev_phase', ['periode'])
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('monev_phase')
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_monev_phase_status";')
}
