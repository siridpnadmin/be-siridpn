'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

const tables: Record<string, string[]> = {
  file_pelaporan: [
    'file_pelaporan_id',
    'perpres_tahap_dpn_d',
    'stakeholder_id',
    'fase',
    'link_file',
  ],
  jenis_pelaksana: ['jenis_pelaksana_id', 'jenis', 'deskripsi'],
  kegiatan: [
    'kegiatan_id',
    'komponen_id',
    'no',
    'deskripsi_kegiatan',
    'target',
    'status',
    'lokasi',
    'perpres_dpn_tahap_id',
  ],
  kegiatan_pelaksana: ['kegiatan_id', 'pelaksana_id', 'catatan', 'kegiatan_pelaksana_id'],
  kegiatan_tahun: ['kegiatan_id', 'tahun_id', 'catatan'],
  komponen: ['komponen_id', 'nama_komponen', 'deskripsi'],
  laporan_monev: [
    'laporan_monev_id',
    'created_at',
    'kegiatan_pelaksana_id',
    'status_kegiatan',
    'konfirmasi_satker',
    'uraian_keterangan',
    'pagu_anggaran',
    'realisasi_anggaran',
    'kendala',
    'tindak_lanjut',
    'link_bukti',
  ],
  pelaksana: ['pelaksana_id', 'jenis_pelaksana_id', 'nama_pelaksana', 'catatan'],
  perpres: ['perpres_id', 'no_perpres', 'status', 'link'],
  perpres_dpn_tahap: [
    'perpres_dpn_tahap_id',
    'perpres_id',
    'dpn_id',
    'tahap',
    'tanggal_penetapan',
    'status',
    'catatan',
  ],
  stakeholder: ['stakeholder_id', 'name', 'type'],
  stakeholder_dpn: ['stakeholder_id', 'dpn_id'],
}

const primaryKeys: Record<string, string[]> = {
  file_pelaporan: ['file_pelaporan_id'],
  jenis_pelaksana: ['jenis_pelaksana_id'],
  kegiatan: ['kegiatan_id'],
  kegiatan_pelaksana: ['kegiatan_pelaksana_id'],
  kegiatan_tahun: ['kegiatan_id', 'tahun_id'],
  komponen: ['komponen_id'],
  laporan_monev: ['laporan_monev_id'],
  pelaksana: ['pelaksana_id'],
  perpres: ['perpres_id'],
  perpres_dpn_tahap: ['perpres_dpn_tahap_id'],
  stakeholder: ['stakeholder_id'],
  stakeholder_dpn: ['stakeholder_id', 'dpn_id'],
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`
}

function createTableSql(tableName: string, columns: string[]) {
  const pkColumns = primaryKeys[tableName] ?? []
  const columnSql = columns.map((column) => `${quoteIdentifier(column)} TEXT`).join(',\n      ')
  const primaryKeySql = pkColumns.length
    ? `,\n      PRIMARY KEY (${pkColumns.map(quoteIdentifier).join(', ')})`
    : ''

  return `
    CREATE TABLE IF NOT EXISTS ${quoteIdentifier(tableName)} (
      ${columnSql}${primaryKeySql}
    );
  `
}

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  for (const [tableName, columns] of Object.entries(tables)) {
    await queryInterface.sequelize.query(createTableSql(tableName, columns))
  }
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  for (const tableName of Object.keys(tables).reverse()) {
    await queryInterface.dropTable(tableName)
  }
}
