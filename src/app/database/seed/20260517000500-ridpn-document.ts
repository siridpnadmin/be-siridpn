'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

const documentsByDpn = [
  {
    kode: 'BABEL',
    no_perpres: 'PERPRES NO 17 Tahun 2024',
    status: 'terbit',
    tahap: 'Pertama',
    link: 'https://peraturan.bpk.go.id/Details/277766/perpres-no-17-tahun-2024',
  },
  {
    kode: 'BYP',
    no_perpres: 'PERPRES NO 88 Tahun 2024',
    status: 'terbit',
    tahap: 'Pertama',
    link: '',
  },
  {
    kode: 'R4',
    no_perpres: 'PERPRES NO 87 Tahun 2024',
    status: 'terbit',
    tahap: 'Pertama',
    link: '',
  },
  {
    kode: 'TOBA',
    no_perpres: 'PERPRES NO 89 Tahun 2024',
    status: 'terbit',
    tahap: 'Pertama',
    link: '',
  },
  {
    kode: 'BAJO',
    no_perpres: 'Rancangan PERPRES',
    status: 'rancangan',
    tahap: 'Pertama',
    link: '',
  },
  {
    kode: 'BTS',
    no_perpres: 'Rancangan PERPRES',
    status: 'rancangan',
    tahap: 'Pertama',
    link: '',
  },
  {
    kode: 'WKTB',
    no_perpres: 'Rancangan PERPRES',
    status: 'rancangan',
    tahap: 'Pertama',
    link: '',
  },
  {
    kode: 'MORO',
    no_perpres: 'Rancangan PERPRES',
    status: 'rancangan',
    tahap: 'Pertama',
    link: '',
  },
]

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const [dpnRecords] = (await queryInterface.sequelize.query('SELECT id, kode FROM dpn;')) as [
    { id: string; kode: string }[],
    unknown,
  ]

  const dpnIdByCode = new Map(dpnRecords.map((dpn) => [dpn.kode, dpn.id]))
  const now = new Date()

  const rows = documentsByDpn
    .filter((document) => dpnIdByCode.has(document.kode))
    .map((document) => ({
        id: uuidv4(),
        no_perpres: document.no_perpres,
        status: document.status,
        dpn_id: dpnIdByCode.get(document.kode),
        tahap: document.tahap,
        link: document.link,
        created_at: now,
        updated_at: now,
      }))

  if (rows.length > 0) {
    await queryInterface.bulkInsert('ridpn_document', rows)
  }
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('ridpn_document', {})
}
