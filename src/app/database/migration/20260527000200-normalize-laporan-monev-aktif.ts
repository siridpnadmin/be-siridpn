import { QueryInterface } from 'sequelize'

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(`
    WITH ranked_laporan AS (
      SELECT
        laporan_monev_id,
        ROW_NUMBER() OVER (
          PARTITION BY kegiatan_pelaksana_id
          ORDER BY created_at DESC, laporan_monev_id DESC
        ) AS row_number
      FROM laporan_monev
    )
    UPDATE laporan_monev
    SET aktif = ranked_laporan.row_number = 1
    FROM ranked_laporan
    WHERE laporan_monev.laporan_monev_id = ranked_laporan.laporan_monev_id
  `)
}

export async function down(_queryInterface: QueryInterface) {
  // Data normalization is intentionally not reverted.
}
