'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('dpn', {
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
      unique: true,
      type: Sequelize.INTEGER,
    },
    kode: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING(50),
    },
    nama_dpn: {
      allowNull: false,
      type: Sequelize.STRING(255),
    },
    lat_pusat: {
      allowNull: true,
      type: Sequelize.DOUBLE,
    },
    long_pusat: {
      allowNull: true,
      type: Sequelize.DOUBLE,
    },
    public_thumbnail: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
  })
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('dpn')
}
