'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('rencana_aksi', {
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
    ridpn_document_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'ridpn_document',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    no_ra: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    komponen: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    kegiatan: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    lokasi: {
      allowNull: false,
      type: Sequelize.STRING(255),
    },
    target: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    tahun: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    pelaksana: {
      allowNull: false,
      type: Sequelize.JSONB,
      defaultValue: [],
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('terlaksana', 'sedang', 'belum', 'tidakDiketahui', 'belumDiisi'),
      defaultValue: 'belumDiisi',
    },
  })

  await queryInterface.addIndex('rencana_aksi', ['ridpn_document_id'])
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('rencana_aksi')
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_rencana_aksi_status";')
}
