'use strict'

import fs from 'fs'
import path from 'path'
import { DataTypes, QueryInterface } from 'sequelize'

type TableSeed = {
  table: string
  file: string
}

const csvDir =
  process.env.SUPABASE_CSV_DIR ||
  'E:\\Project\\Kemenpar\\Gdrive\\SQL\\SUPABASE SQL DUMP-20260517T121758Z-3-001\\SUPABASE SQL DUMP\\20260416\\CSV'

const tables: TableSeed[] = [
  {
    "table": "tahun",
    "file": "tahun_202605171954.csv"
  },
  {
    "table": "dpn",
    "file": "dpn_202605171954.csv"
  },
  {
    "table": "jenis_pelaksana",
    "file": "jenis_pelaksana_202605171954.csv"
  },
  {
    "table": "komponen",
    "file": "komponen_202605171954.csv"
  },
  {
    "table": "perpres",
    "file": "perpres_202605171954.csv"
  },
  {
    "table": "perpres_dpn_tahap",
    "file": "perpres_dpn_tahap_202605171954.csv"
  },
  {
    "table": "stakeholder",
    "file": "stakeholder_202605171954.csv"
  },
  {
    "table": "stakeholder_dpn",
    "file": "stakeholder_dpn_202605171954.csv"
  },
  {
    "table": "pelaksana",
    "file": "pelaksana_202605171954.csv"
  },
  {
    "table": "kegiatan",
    "file": "kegiatan_202605171954.csv"
  },
  {
    "table": "kegiatan_tahun",
    "file": "kegiatan_tahun_202605171954.csv"
  },
  {
    "table": "kegiatan_pelaksana",
    "file": "kegiatan_pelaksana_202605171954.csv"
  },
  {
    "table": "laporan_monev",
    "file": "laporan_monev_202605171954.csv"
  },
  {
    "table": "file_pelaporan",
    "file": "file_pelaporan_202605171954.csv"
  }
]

const batchSize = 500

function parseCsv(content: string) {
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < content.length; index++) {
    const char = content[index]
    const next = content[index + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"'
        index++
      } else if (char === '"') {
        inQuotes = false
      } else {
        value += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      row.push(value)
      value = ''
      continue
    }

    if (char === '\n') {
      row.push(value)
      rows.push(row)
      row = []
      value = ''
      continue
    }

    if (char !== '\r') {
      value += char
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value)
    rows.push(row)
  }

  return rows
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`
}

async function truncateTables(queryInterface: QueryInterface) {
  const tableSql = tables.map((item) => quoteIdentifier(item.table)).join(', ')
  await queryInterface.sequelize.query(`TRUNCATE TABLE ${tableSql} RESTART IDENTITY CASCADE`)
}

async function insertRows(queryInterface: QueryInterface, table: string, rows: Record<string, string | null>[]) {
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    await queryInterface.bulkInsert(table, rows.slice(offset, offset + batchSize))
  }
}

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await truncateTables(queryInterface)

  for (const item of tables) {
    const filePath = path.join(csvDir, item.file)
    const rows = parseCsv(fs.readFileSync(filePath, 'utf8'))
    const columns = rows[0] || []
    const dataRows = rows.slice(1).filter((row) => row.some((value) => value !== ''))
    const payload = dataRows.map((row) =>
      Object.fromEntries(columns.map((column, index) => [column, row[index] === '' || row[index] === undefined ? null : row[index]]))
    )

    await insertRows(queryInterface, item.table, payload)
  }
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await truncateTables(queryInterface)
}
