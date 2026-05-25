'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('user_dpn_access', {
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
    user_id: {
      allowNull: false,
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    dpn_id: {
      allowNull: false,
      type: Sequelize.BIGINT,
      references: {
        model: 'dpn',
        key: 'dpn_id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  })

  await queryInterface.addConstraint('user_dpn_access', {
    type: 'unique',
    fields: ['user_id', 'dpn_id'],
    name: 'user_dpn_access_user_id_dpn_id_key',
  })
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('user_dpn_access')
}
