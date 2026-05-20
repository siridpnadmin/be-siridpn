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
        model: 'user',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    dpn_code: {
      allowNull: false,
      type: Sequelize.STRING('50'),
    },
  })

  await queryInterface.addConstraint('user_dpn_access', {
    type: 'unique',
    fields: ['user_id', 'dpn_code'],
    name: 'UNIQUE_USER_DPN_ACCESS',
  })
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('user_dpn_access')
}
