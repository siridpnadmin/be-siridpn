import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  const tables = await queryInterface.showAllTables()
  if (tables.includes('notifications')) return

  await queryInterface.createTable('notifications', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recipient_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    recipient_role_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      references: {
        model: 'roles',
        key: 'code',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    actor_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'info',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'general',
    },
    title: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
  })

  await queryInterface.addIndex('notifications', ['recipient_user_id', 'is_read'], {
    name: 'notifications_recipient_user_id_is_read_idx',
  })
  await queryInterface.addIndex('notifications', ['recipient_role_code', 'is_read'], {
    name: 'notifications_recipient_role_code_is_read_idx',
  })
  await queryInterface.addIndex('notifications', ['created_at'], {
    name: 'notifications_created_at_idx',
  })
}

export async function down(queryInterface: QueryInterface) {
  const tables = await queryInterface.showAllTables()
  if (tables.includes('notifications')) {
    await queryInterface.dropTable('notifications')
  }
}
