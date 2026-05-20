'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('kta_area', {
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
    dpn_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'dpn',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    nama_kta: {
      allowNull: false,
      type: Sequelize.STRING(150),
    },
    kabupaten_kota: {
      allowNull: false,
      type: Sequelize.JSONB,
      defaultValue: [],
    },
    nomor_urut: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 1,
    },
  })

  await queryInterface.addIndex('kta_area', ['dpn_id'])
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('kta_area')
}
