'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('tahap', {
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
      type: Sequelize.DATE,
    },
    nama: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    tahun_mulai_id: {
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'tahun',
        key: 'id',
      },
    },
    tahun_selesai_id: {
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'tahun',
        key: 'id',
      },
    },
  })
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('tahap')
}
