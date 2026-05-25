'use strict'

import { DataTypes, QueryInterface } from 'sequelize'

const tables = [
  {
    "table": "dpn",
    "primaryKeys": [
      "dpn_id"
    ],
    "columns": [
      [
        "dpn_id",
        "BIGINT",
        false
      ],
      [
        "kode",
        "TEXT",
        false
      ],
      [
        "nama_dpn",
        "TEXT",
        false
      ],
      [
        "lat_pusat",
        "DOUBLE",
        true
      ],
      [
        "long_pusat",
        "DOUBLE",
        true
      ],
      [
        "public_thumbnail",
        "TEXT",
        true
      ]
    ]
  },
  {
    "table": "jenis_pelaksana",
    "primaryKeys": [
      "jenis_pelaksana_id"
    ],
    "columns": [
      [
        "jenis_pelaksana_id",
        "BIGINT",
        false
      ],
      [
        "jenis",
        "STRING",
        false
      ],
      [
        "deskripsi",
        "TEXT",
        true
      ]
    ]
  },
  {
    "table": "komponen",
    "primaryKeys": [
      "komponen_id"
    ],
    "columns": [
      [
        "komponen_id",
        "BIGINT",
        false
      ],
      [
        "nama_komponen",
        "STRING",
        false
      ],
      [
        "deskripsi",
        "TEXT",
        true
      ]
    ]
  },
  {
    "table": "perpres",
    "primaryKeys": [
      "perpres_id"
    ],
    "columns": [
      [
        "perpres_id",
        "BIGINT",
        false
      ],
      [
        "no_perpres",
        "STRING",
        false
      ],
      [
        "status",
        "STATUS_PERPRES",
        false
      ],
      [
        "link",
        "TEXT",
        true
      ]
    ]
  },
  {
    "table": "tahun",
    "primaryKeys": [
      "tahun_id"
    ],
    "columns": [
      [
        "tahun_id",
        "BIGINT",
        false
      ],
      [
        "tahun_text",
        "BIGINT",
        false
      ]
    ]
  },
  {
    "table": "stakeholder",
    "primaryKeys": [
      "stakeholder_id"
    ],
    "columns": [
      [
        "stakeholder_id",
        "BIGINT",
        false
      ],
      [
        "name",
        "STRING_255",
        true
      ],
      [
        "type",
        "INSTITUTION_TYPE",
        true
      ]
    ]
  },
  {
    "table": "perpres_dpn_tahap",
    "primaryKeys": [
      "perpres_dpn_tahap_id"
    ],
    "columns": [
      [
        "perpres_dpn_tahap_id",
        "INTEGER",
        false
      ],
      [
        "perpres_id",
        "BIGINT",
        false
      ],
      [
        "dpn_id",
        "BIGINT",
        false
      ],
      [
        "tahap",
        "STRING",
        false
      ],
      [
        "tanggal_penetapan",
        "DATEONLY",
        true
      ],
      [
        "status",
        "STATUS_PERPRES",
        true
      ],
      [
        "catatan",
        "TEXT",
        true
      ]
    ]
  },
  {
    "table": "kegiatan",
    "primaryKeys": [
      "kegiatan_id"
    ],
    "columns": [
      [
        "kegiatan_id",
        "BIGINT",
        false
      ],
      [
        "komponen_id",
        "BIGINT",
        false
      ],
      [
        "no",
        "STRING",
        false
      ],
      [
        "deskripsi_kegiatan",
        "TEXT",
        false
      ],
      [
        "target",
        "STRING",
        false
      ],
      [
        "status",
        "STATUS_KEGIATAN",
        false
      ],
      [
        "lokasi",
        "STRING",
        false
      ],
      [
        "perpres_dpn_tahap_id",
        "INTEGER",
        false
      ]
    ]
  },
  {
    "table": "pelaksana",
    "primaryKeys": [
      "pelaksana_id"
    ],
    "columns": [
      [
        "pelaksana_id",
        "BIGINT",
        false
      ],
      [
        "jenis_pelaksana_id",
        "BIGINT",
        false
      ],
      [
        "nama_pelaksana",
        "STRING",
        false
      ],
      [
        "catatan",
        "TEXT",
        true
      ]
    ]
  },
  {
    "table": "kegiatan_pelaksana",
    "primaryKeys": [
      "kegiatan_pelaksana_id"
    ],
    "columns": [
      [
        "kegiatan_id",
        "BIGINT",
        false
      ],
      [
        "pelaksana_id",
        "BIGINT",
        false
      ],
      [
        "catatan",
        "TEXT",
        true
      ],
      [
        "kegiatan_pelaksana_id",
        "BIGINT",
        false
      ]
    ]
  },
  {
    "table": "kegiatan_tahun",
    "primaryKeys": [
      "kegiatan_id",
      "tahun_id"
    ],
    "columns": [
      [
        "kegiatan_id",
        "BIGINT",
        false
      ],
      [
        "tahun_id",
        "BIGINT",
        false
      ],
      [
        "catatan",
        "TEXT",
        true
      ]
    ]
  },
  {
    "table": "file_pelaporan",
    "primaryKeys": [
      "file_pelaporan_id"
    ],
    "columns": [
      [
        "file_pelaporan_id",
        "INTEGER",
        false
      ],
      [
        "perpres_tahap_dpn_d",
        "INTEGER",
        false
      ],
      [
        "stakeholder_id",
        "INTEGER",
        false
      ],
      [
        "fase",
        "FASE_TYPE",
        false
      ],
      [
        "link_file",
        "TEXT",
        true
      ]
    ]
  },
  {
    "table": "stakeholder_dpn",
    "primaryKeys": [
      "stakeholder_id",
      "dpn_id"
    ],
    "columns": [
      [
        "stakeholder_id",
        "INTEGER",
        false
      ],
      [
        "dpn_id",
        "INTEGER",
        false
      ]
    ]
  },
  {
    "table": "laporan_monev",
    "primaryKeys": [
      "laporan_monev_id"
    ],
    "columns": [
      [
        "laporan_monev_id",
        "BIGINT",
        false
      ],
      [
        "created_at",
        "DATE",
        false
      ],
      [
        "kegiatan_pelaksana_id",
        "BIGINT",
        false
      ],
      [
        "status_kegiatan",
        "STATUS_KEGIATAN",
        false
      ],
      [
        "konfirmasi_satker",
        "TEXT",
        true
      ],
      [
        "uraian_keterangan",
        "TEXT",
        true
      ],
      [
        "pagu_anggaran",
        "DOUBLE",
        true
      ],
      [
        "realisasi_anggaran",
        "DOUBLE",
        true
      ],
      [
        "kendala",
        "TEXT",
        true
      ],
      [
        "tindak_lanjut",
        "TEXT",
        true
      ],
      [
        "link_bukti",
        "TEXT",
        true
      ],
      [
        "bukti_tipe",
        "STRING_20",
        true
      ],
      [
        "progress_semester_1",
        "DOUBLE",
        true
      ],
      [
        "progress_semester_2",
        "DOUBLE",
        true
      ],
      [
        "indikator",
        "TEXT",
        true
      ],
      [
        "output",
        "TEXT",
        true
      ],
      [
        "outcome",
        "TEXT",
        true
      ]
    ]
  }
] as const

const foreignKeys = [
  { table: 'perpres_dpn_tahap', field: 'dpn_id', target: 'dpn', targetKey: 'dpn_id', name: 'fk_dpn' },
  { table: 'perpres_dpn_tahap', field: 'perpres_id', target: 'perpres', targetKey: 'perpres_id', name: 'fk_perpres' },
  { table: 'kegiatan', field: 'komponen_id', target: 'komponen', targetKey: 'komponen_id', name: 'KEGIATAN_komponen_id_fkey' },
  { table: 'kegiatan', field: 'perpres_dpn_tahap_id', target: 'perpres_dpn_tahap', targetKey: 'perpres_dpn_tahap_id', name: 'fk_kegiatan_perpres_dpn_tahap' },
  { table: 'kegiatan_tahun', field: 'kegiatan_id', target: 'kegiatan', targetKey: 'kegiatan_id', name: 'KEGIATAN_TAHUN_kegiatan_id_fkey', onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
  { table: 'kegiatan_tahun', field: 'tahun_id', target: 'tahun', targetKey: 'tahun_id', name: 'KEGIATAN_TAHUN_tahun_id_fkey', onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
  { table: 'pelaksana', field: 'jenis_pelaksana_id', target: 'jenis_pelaksana', targetKey: 'jenis_pelaksana_id', name: 'PELAKSANA_jenis_pelaksana_id_fkey', onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
  { table: 'kegiatan_pelaksana', field: 'kegiatan_id', target: 'kegiatan', targetKey: 'kegiatan_id', name: 'kegiatan_pelaksana_kegiatan_id_fkey', onUpdate: 'CASCADE', onDelete: 'CASCADE' },
  { table: 'kegiatan_pelaksana', field: 'pelaksana_id', target: 'pelaksana', targetKey: 'pelaksana_id', name: 'kegiatan_pelaksana_pelaksana_id_fkey', onUpdate: 'CASCADE', onDelete: 'CASCADE' },
  { table: 'laporan_monev', field: 'kegiatan_pelaksana_id', target: 'kegiatan_pelaksana', targetKey: 'kegiatan_pelaksana_id', name: 'laporan_monev_kegiatan_pelaksana_id_fkey', onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
  { table: 'stakeholder_dpn', field: 'dpn_id', target: 'dpn', targetKey: 'dpn_id', name: 'stakeholder_dpn_dpn_id_fkey' },
  { table: 'stakeholder_dpn', field: 'stakeholder_id', target: 'stakeholder', targetKey: 'stakeholder_id', name: 'stakeholder_dpn_stakeholder_id_fkey' },
  { table: 'file_pelaporan', field: 'stakeholder_id', target: 'stakeholder', targetKey: 'stakeholder_id', name: 'file_pelaporan_stakeholder_id_fkey' },
] as const

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`
}

function columnType(kind: string, Sequelize: typeof DataTypes) {
  switch (kind) {
    case 'BIGINT': return Sequelize.BIGINT
    case 'INTEGER': return Sequelize.INTEGER
    case 'DOUBLE': return Sequelize.DOUBLE
    case 'DATE': return Sequelize.DATE
    case 'DATEONLY': return Sequelize.DATEONLY
    case 'STRING': return Sequelize.TEXT
    case 'STRING_255': return Sequelize.STRING(255)
    case 'STRING_20': return Sequelize.STRING(20)
    case 'TEXT': return Sequelize.TEXT
    case 'FASE_TYPE': return Sequelize.ENUM('Fase 1', 'Fase 2')
    case 'INSTITUTION_TYPE': return Sequelize.ENUM('Pusat', 'Prov', 'Kota/Kab')
    case 'STATUS_KEGIATAN': return Sequelize.ENUM('sedang dilaksanakan', 'terlaksana', 'belum terlaksana', 'tidak diketahui', 'belum dikonfirmasi')
    case 'STATUS_PERPRES': return Sequelize.ENUM('draft', 'terpublikasi')
    default: return Sequelize.TEXT
  }
}

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  for (const table of tables) {
    const attributes = Object.fromEntries(
      table.columns.map(([name, kind, nullable]) => [
        name,
        {
          type: columnType(kind, Sequelize),
          allowNull: nullable,
          primaryKey: (table.primaryKeys as readonly string[]).includes(name),
        },
      ])
    )

    await queryInterface.createTable(table.table, attributes)
  }

  await queryInterface.addConstraint('dpn', { type: 'unique', fields: ['kode'], name: 'DPN_nama_dpn_key' })
  await queryInterface.addConstraint('pelaksana', { type: 'unique', fields: ['nama_pelaksana'], name: 'PELAKSANA_nama_pelaksana_key' })
  await queryInterface.addConstraint('perpres', { type: 'unique', fields: ['no_perpres'], name: 'PERPRES_no_perpres_key' })
  await queryInterface.addConstraint('tahun', { type: 'unique', fields: ['tahun_text'], name: 'tahun_tahun_key' })
  await queryInterface.addConstraint('perpres_dpn_tahap', { type: 'unique', fields: ['perpres_id', 'dpn_id', 'tahap'], name: 'perpres_dpn_tahap_unique' })

  for (const fk of foreignKeys) {
    await queryInterface.addConstraint(fk.table, {
      type: 'foreign key',
      fields: [fk.field],
      name: fk.name,
      references: { table: fk.target, field: fk.targetKey },
      onUpdate: 'onUpdate' in fk ? fk.onUpdate : 'CASCADE',
      onDelete: 'onDelete' in fk ? fk.onDelete : 'RESTRICT',
    })
  }
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  for (const table of [...tables].reverse()) {
    await queryInterface.dropTable(table.table)
  }

  await queryInterface.sequelize.query(`
    DROP TYPE IF EXISTS ${quoteIdentifier('enum_file_pelaporan_fase')};
    DROP TYPE IF EXISTS ${quoteIdentifier('enum_stakeholder_type')};
    DROP TYPE IF EXISTS ${quoteIdentifier('enum_kegiatan_status')};
    DROP TYPE IF EXISTS ${quoteIdentifier('enum_laporan_monev_status_kegiatan')};
    DROP TYPE IF EXISTS ${quoteIdentifier('enum_perpres_status')};
    DROP TYPE IF EXISTS ${quoteIdentifier('enum_perpres_dpn_tahap_status')};
  `)
}
