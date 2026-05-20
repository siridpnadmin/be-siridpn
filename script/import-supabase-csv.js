'use strict'

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const csvDir =
  process.argv[2] ||
  'E:\\Project\\Kemenpar\\Gdrive\\SQL\\SUPABASE SQL DUMP-20260517T121758Z-3-001\\SUPABASE SQL DUMP\\20260416\\CSV'

const csvSuffixPattern = /_\d{12}\.csv$/i
const batchSize = 500

function parseCsv(content) {
  const rows = []
  let row = []
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

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`
}

function tableNameFromFile(fileName) {
  return fileName.replace(csvSuffixPattern, '')
}

async function tableExists(client, tableName) {
  const result = await client.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = $1
      ) AS exists
    `,
    [tableName]
  )

  return result.rows[0].exists
}

async function countTable(client, tableName) {
  const result = await client.query(`SELECT COUNT(*)::int AS count FROM ${quoteIdentifier(tableName)}`)
  return result.rows[0].count
}

async function createTable(client, tableName, columns) {
  const columnSql = columns.map((column) => `${quoteIdentifier(column)} TEXT`).join(', ')
  await client.query(`CREATE TABLE ${quoteIdentifier(tableName)} (${columnSql})`)
}

async function insertRows(client, tableName, columns, rows) {
  if (rows.length === 0) {
    return 0
  }

  const tableSql = quoteIdentifier(tableName)
  const columnSql = columns.map(quoteIdentifier).join(', ')
  let inserted = 0

  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize)
    const values = []
    const placeholders = batch.map((row, rowIndex) => {
      const rowPlaceholders = columns.map((_, columnIndex) => {
        values.push(row[columnIndex] === '' || row[columnIndex] === undefined ? null : row[columnIndex])
        return `$${rowIndex * columns.length + columnIndex + 1}`
      })

      return `(${rowPlaceholders.join(', ')})`
    })

    await client.query(
      `INSERT INTO ${tableSql} (${columnSql}) VALUES ${placeholders.join(', ')}`,
      values
    )
    inserted += batch.length
  }

  return inserted
}

async function main() {
  if (!fs.existsSync(csvDir)) {
    throw new Error(`CSV directory not found: ${csvDir}`)
  }

  const client = new Client({
    host: process.env.SEQUELIZE_HOST,
    port: Number(process.env.SEQUELIZE_PORT),
    database: process.env.SEQUELIZE_DATABASE,
    user: process.env.SEQUELIZE_USERNAME,
    password: process.env.SEQUELIZE_PASSWORD,
  })

  await client.connect()

  const files = fs
    .readdirSync(csvDir)
    .filter((file) => csvSuffixPattern.test(file))
    .sort()

  const summary = []

  for (const file of files) {
    const tableName = tableNameFromFile(file)
    const filePath = path.join(csvDir, file)
    const rows = parseCsv(fs.readFileSync(filePath, 'utf8'))

    if (rows.length === 0) {
      summary.push({ tableName, action: 'skipped_empty_file', inserted: 0 })
      continue
    }

    const columns = rows[0]
    const dataRows = rows.slice(1).filter((row) => row.some((value) => value !== ''))
    const exists = await tableExists(client, tableName)

    if (exists) {
      const existingRows = await countTable(client, tableName)
      if (existingRows > 0) {
        summary.push({ tableName, action: 'skipped_existing_data', existingRows, inserted: 0 })
        continue
      }
    } else {
      await createTable(client, tableName, columns)
    }

    const inserted = await insertRows(client, tableName, columns, dataRows)
    summary.push({ tableName, action: exists ? 'inserted_into_empty_table' : 'created_and_inserted', inserted })
  }

  await client.end()

  for (const item of summary) {
    console.log(JSON.stringify(item))
  }
}

main().catch(async (error) => {
  console.error(error)
  process.exit(1)
})
