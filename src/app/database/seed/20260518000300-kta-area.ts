'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

const ktaByDpn = {
  LMBK: [
    ['KTA Gili-Senggigi', ['Kabupaten Lombok Utara', 'Kabupaten Lombok Barat']],
    ['KTA Pantai Selatan', ['Kabupaten Lombok Barat', 'Kabupaten Lombok Tengah', 'Kabupaten Lombok Timur']],
    ['KTA Mataram dan Sekitarnya', ['Kota Mataram', 'Kabupaten Lombok Barat']],
    ['KTA Rinjani dan Sekitarnya', ['Kabupaten Lombok Tengah', 'Kabupaten Lombok Utara', 'Kabupaten Lombok Timur']],
  ],
  MND: [
    ['Manado-Bunaken', ['Kota Manado', 'Kabupaten Minahasa Utara']],
    ['Likupang', ['Kabupaten Minahasa Utara']],
    ['Bitung-Lembeh', ['Kota Bitung']],
    ['Tomohon', ['Kota Tomohon', 'Kabupaten Minahasa']],
    ['Tondano', ['Kabupaten Minahasa']],
    ['Minahasa Pantai', ['Kabupaten Minahasa']],
    ['Airmadidi', ['Kabupaten Minahasa Utara']],
  ],
  BABEL: [
    ['KTA Menthok-Teritip', ['Kabupaten Bangka Barat']],
    ['KTA Belinyu', ['Kabupaten Bangka']],
    ['KTA Sungailiat', ['Kabupaten Bangka']],
    ['KTA Pangkal Pinang', ['Kota Pangkal Pinang', 'Kabupaten Bangka Tengah']],
    ['KTA Semujur Kurau', ['Kabupaten Bangka Tengah']],
    ['KTA Koba-Berikat', ['Kabupaten Bangka Tengah']],
    ['KTA Toboali-Lepar', ['Kabupaten Bangka Selatan']],
    ['KTA Batu Betumpang', ['Kabupaten Bangka Selatan']],
    ['KTA Tanjung Pandan-Tanjung Kelayang', ['Kabupaten Belitung']],
    ['KTA Seliu-Tj.Rusa', ['Kabupaten Belitung']],
    ['KTA Kelumpang-Sekunyit', ['Kabupaten Belitung Timur']],
    ['KTA Manggar-Gantung', ['Kabupaten Belitung Timur']],
    ['KTA Bukulimau', ['Kabupaten Belitung Timur']],
  ],
  R4: [
    ['Selat Dampier', ['Kabupaten Raja Ampat']],
    ['Misool', ['Kabupaten Raja Ampat']],
    ['Wayag', ['Kabupaten Raja Ampat']],
  ],
  BYP: [
    ['KTA Borobudur', ['Kabupaten Magelang']],
    ['KTA Yogyakarta', ['Kota Yogyakarta', 'Kabupaten Bantul']],
    ['KTA Prambanan', ['Kabupaten Sleman', 'Kabupaten Klaten']],
  ],
  TOBA: [
    ['Parapat', ['Kabupaten Simalungun', 'Kabupaten Toba']],
    ['Simanindo', ['Kabupaten Samosir']],
    ['Pangururan', ['Kabupaten Samosir']],
    ['Balige', ['Kabupaten Toba']],
    ['Muara', ['Kabupaten Tapanuli Utara', 'Kabupaten Humbang Hasundutan']],
    ['Merek', ['Kabupaten Karo', 'Kabupaten Dairi']],
  ],
  BAJO: [
    ['Taman Nasional Komodo', ['Kabupaten Manggarai Barat']],
    ['Labuan Bajo dan sekitarnya', ['Kabupaten Manggarai Barat']],
  ],
  BTS: [
    ['Tosari', ['Kabupaten Pasuruan']],
    ['Sukapura', ['Kabupaten Probolinggo']],
    ['Senduro', ['Kabupaten Lumajang']],
    ['Poncokusumo', ['Kabupaten Malang']],
    ['Klojen-Blimbing', ['Kota Malang']],
  ],
  WKTB: [
    ['Wangi-Wangi', ['Kabupaten Wakatobi']],
    ['Kaledupa', ['Kabupaten Wakatobi']],
    ['Tomia', ['Kabupaten Wakatobi']],
    ['Binongki', ['Kabupaten Wakatobi']],
  ],
  MORO: [
    ['Moro Point', ['Kabupaten Pulau Morotai']],
    ['Rao', ['Kabupaten Pulau Morotai']],
    ['Pasifik', ['Kabupaten Pulau Morotai']],
  ],
} satisfies Record<string, [string, string[]][]>

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const [dpnRecords] = (await queryInterface.sequelize.query('SELECT id, kode FROM dpn;')) as [
    { id: string; kode: string }[],
    unknown,
  ]
  const dpnIdByCode = new Map(dpnRecords.map((dpn) => [dpn.kode, dpn.id]))
  const now = new Date()

  const rows = Object.entries(ktaByDpn).flatMap(([kode, ktaRows]) => {
    const dpnId = dpnIdByCode.get(kode)
    if (!dpnId) return []

    return ktaRows.map(([nama_kta, kabupaten_kota], index) => ({
      id: uuidv4(),
      dpn_id: dpnId,
      nama_kta,
      kabupaten_kota: JSON.stringify(kabupaten_kota),
      nomor_urut: index + 1,
      created_at: now,
      updated_at: now,
    }))
  })

  if (rows.length > 0) {
    await queryInterface.bulkInsert('kta_area', rows)
  }
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('kta_area', {})
}
