'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('roles', {
    code: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING(50),
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING(100),
    },
    description: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    manageable: {
      allowNull: false,
      defaultValue: false,
      type: Sequelize.BOOLEAN,
    },
  })

  await queryInterface.createTable('users', {
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
    name: {
      allowNull: false,
      type: Sequelize.STRING(150),
    },
    email: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING(150),
    },
    password: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    role_code: {
      allowNull: false,
      type: Sequelize.STRING(50),
      references: {
        model: 'roles',
        key: 'code',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
  })

  await queryInterface.addIndex('users', ['email'])
  await queryInterface.addIndex('users', ['role_code'])
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.dropTable('users')
  await queryInterface.dropTable('roles')
}
