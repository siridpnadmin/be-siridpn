'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

const komponenList = ['Kelembagaan', 'Infrastruktur', 'SDM dan Masyarakat', 'Iklim Usaha']
const lokasiList = ['Kab. Toba, Sumut', 'Lombok Tengah, NTB', 'Labuan Bajo, NTT']
const pelaksanaList = [
  ['Kementerian PUPR'],
  ['Pemda Setempat', 'Kementerian Pariwisata'],
  ['BUMN Terkait'],
  ['Kementerian PUPR', 'Pemda Setempat', 'BUMN Terkait'],
]
const tahunList = ['2024', '2025', '2024, 2025', '2023, 2024']
const statuses = ['terlaksana', 'sedang', 'belum', 'tidakDiketahui', 'belumDiisi']

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const [documents] = (await queryInterface.sequelize.query(`
    SELECT rd.id, rd.no_perpres, rd.tahap, d.kode
    FROM ridpn_document rd
    LEFT JOIN dpn d ON d.id = rd.dpn_id
    ORDER BY rd.created_at DESC, rd.no_perpres ASC;
  `)) as [
    { id: string; no_perpres: string; tahap: string; kode: string | null }[],
    unknown,
  ]

  const now = new Date()
  const rows = documents.flatMap((document, documentIndex) => {
    const offset = documentIndex % komponenList.length
    const kode = document.kode ?? `DOK-${documentIndex + 1}`

    return Array.from({ length: 27 }, (_, index) => {
      const sequence = index + 1
      const komponenIndex = (index + offset) % komponenList.length
      const lokasiIndex = (index + documentIndex) % lokasiList.length
      const pelaksanaIndex = (index + offset) % pelaksanaList.length
      const tahunIndex = (index + documentIndex) % tahunList.length

      return {
        id: uuidv4(),
        ridpn_document_id: document.id,
        no_ra: `RA-${String(sequence).padStart(3, '0')}`,
        komponen: komponenList[komponenIndex],
        kegiatan: `Program ${kode} tahap ${document.tahap} - ${document.no_perpres} kegiatan prioritas ${sequence}`,
        lokasi: lokasiList[lokasiIndex],
        target: sequence % 2 === 0 ? `${50 + documentIndex * 5} unit` : `${100 + documentIndex * 10} km`,
        tahun: tahunList[tahunIndex],
        pelaksana: JSON.stringify(pelaksanaList[pelaksanaIndex]),
        status: statuses[(index + documentIndex) % statuses.length],
        created_at: now,
        updated_at: now,
      }
    })
  })

  if (rows.length > 0) {
    await queryInterface.bulkInsert('rencana_aksi', rows)
  }
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('rencana_aksi', {})
}
