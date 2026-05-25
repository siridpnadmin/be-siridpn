import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  const tables = await queryInterface.showAllTables()
  if (tables.includes('kta_area')) return

  await queryInterface.createTable('kta_area', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    dpn_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'dpn',
        key: 'dpn_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    nama_kta: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    kabupaten_kota: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    nomor_urut: {
      type: DataTypes.INTEGER,
      allowNull: false,
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

  await queryInterface.addConstraint('kta_area', {
    type: 'unique',
    fields: ['dpn_id', 'nama_kta'],
    name: 'kta_area_dpn_id_nama_kta_key',
  })

  await queryInterface.addIndex('kta_area', ['dpn_id'], {
    name: 'kta_area_dpn_id_idx',
  })
}

export async function down(queryInterface: QueryInterface) {
  const tables = await queryInterface.showAllTables()
  if (tables.includes('kta_area')) {
    await queryInterface.dropTable('kta_area')
  }
}
