'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

const uniqueIndexName = 'users_name_unique'
const checkConstraintName = 'users_name_username_format'

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.sequelize.query(`
    WITH normalized AS (
      SELECT
        id,
        COALESCE(
          NULLIF(
            LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9._-]+', '_', 'g')),
            ''
          ),
          'user'
        ) AS username_base
      FROM users
    ),
    numbered AS (
      SELECT
        id,
        username_base,
        ROW_NUMBER() OVER (PARTITION BY username_base ORDER BY id) AS duplicate_number
      FROM normalized
    )
    UPDATE users
    SET name = CASE
      WHEN numbered.duplicate_number = 1 THEN numbered.username_base
      ELSE numbered.username_base || '_' || numbered.duplicate_number
    END
    FROM numbered
    WHERE users.id = numbered.id;
  `)

  await queryInterface.addIndex('users', ['name'], {
    unique: true,
    name: uniqueIndexName,
  })

  await queryInterface.sequelize.query(`
    ALTER TABLE users
    ADD CONSTRAINT ${checkConstraintName}
    CHECK (name = LOWER(name) AND name ~ '^[a-z0-9._-]+$');
  `)
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.sequelize.query(`
    ALTER TABLE users
    DROP CONSTRAINT IF EXISTS ${checkConstraintName};
  `)
  await queryInterface.removeIndex('users', uniqueIndexName)
}
