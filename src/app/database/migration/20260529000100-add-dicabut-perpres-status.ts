import type { QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      ALTER TYPE "enum_perpres_status" ADD VALUE IF NOT EXISTS 'dicabut';
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END $$;
  `)
  await queryInterface.sequelize.query(`
    DO $$
    BEGIN
      ALTER TYPE "enum_perpres_dpn_tahap_status" ADD VALUE IF NOT EXISTS 'dicabut';
    EXCEPTION
      WHEN undefined_object THEN NULL;
    END $$;
  `)
}

export async function down() {
  // PostgreSQL enum values cannot be removed safely without recreating the type.
}
