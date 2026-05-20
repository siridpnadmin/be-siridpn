'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('ridpn_document', {
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
    no_perpres: {
      allowNull: false,
      type: Sequelize.STRING(255),
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM('terbit', 'rancangan'),
      defaultValue: 'rancangan',
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
    tahap: {
      allowNull: false,
      type: Sequelize.STRING(50),
    },
    link: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
  })
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('ridpn_document')
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ridpn_document_status";')
}
