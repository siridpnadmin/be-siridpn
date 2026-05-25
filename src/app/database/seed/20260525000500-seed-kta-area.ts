import { QueryInterface, QueryTypes } from 'sequelize'

type KtaSeed = {
  kode: string
  name: string
  kta: Array<{
    name: string
    kabupatenKota: string[]
  }>
}

const ktaSeeds: KtaSeed[] = [
  {
    kode: 'LMBK',
    name: 'Lombok-Gili Tramena',
    kta: [
      { name: 'KTA Gili-Senggigi', kabupatenKota: ['Kabupaten Lombok Utara', 'Kabupaten Lombok Barat'] },
      {
        name: 'KTA Pantai Selatan',
        kabupatenKota: ['Kabupaten Lombok Barat', 'Kabupaten Lombok Tengah', 'Kabupaten Lombok Timur'],
      },
      { name: 'KTA Mataram dan Sekitarnya', kabupatenKota: ['Kota Mataram', 'Kabupaten Lombok Barat'] },
      {
        name: 'KTA Rinjani dan Sekitarnya',
        kabupatenKota: ['Kabupaten Lombok Tengah', 'Kabupaten Lombok Utara', 'Kabupaten Lombok Timur'],
      },
    ],
  },
  {
    kode: 'MND',
    name: 'Manado Likupang',
    kta: [
      { name: 'Manado-Bunaken', kabupatenKota: ['Kota Manado', 'Kabupaten Minahasa Utara'] },
      { name: 'Likupang', kabupatenKota: ['Kabupaten Minahasa Utara'] },
      { name: 'Bitung-Lembeh', kabupatenKota: ['Kota Bitung'] },
      { name: 'Tomohon', kabupatenKota: ['Kota Tomohon', 'Kabupaten Minahasa'] },
      { name: 'Tondano', kabupatenKota: ['Kabupaten Minahasa'] },
      { name: 'Minahasa Pantai', kabupatenKota: ['Kabupaten Minahasa'] },
      { name: 'Airmadidi', kabupatenKota: ['Kabupaten Minahasa Utara'] },
    ],
  },
  {
    kode: 'BABEL',
    name: 'Bangka Belitung',
    kta: [
      { name: 'KTA Menthok-Teritip', kabupatenKota: ['Kabupaten Bangka Barat'] },
      { name: 'KTA Belinyu', kabupatenKota: ['Kabupaten Bangka'] },
      { name: 'KTA Sungailiat', kabupatenKota: ['Kabupaten Bangka'] },
      { name: 'KTA Pangkal Pinang', kabupatenKota: ['Kota Pangkal Pinang', 'Kabupaten Bangka Tengah'] },
      { name: 'KTA Semujur Kurau', kabupatenKota: ['Kabupaten Bangka Tengah'] },
      { name: 'KTA Koba-Berikat', kabupatenKota: ['Kabupaten Bangka Tengah'] },
      { name: 'KTA Toboali-Lepar', kabupatenKota: ['Kabupaten Bangka Selatan'] },
      { name: 'KTA Batu Betumpang', kabupatenKota: ['Kabupaten Bangka Selatan'] },
      { name: 'KTA Tanjung Pandan-Tanjung Kelayang', kabupatenKota: ['Kabupaten Belitung'] },
      { name: 'KTA Seliu-Tj.Rusa', kabupatenKota: ['Kabupaten Belitung'] },
      { name: 'KTA Kelumpang-Sekunyit', kabupatenKota: ['Kabupaten Belitung Timur'] },
      { name: 'KTA Manggar-Gantung', kabupatenKota: ['Kabupaten Belitung Timur'] },
      { name: 'KTA Bukulimau', kabupatenKota: ['Kabupaten Belitung Timur'] },
    ],
  },
  {
    kode: 'R4',
    name: 'Raja Ampat',
    kta: [
      { name: 'Selat Dampier', kabupatenKota: ['Kabupaten Raja Ampat'] },
      { name: 'Misool', kabupatenKota: ['Kabupaten Raja Ampat'] },
      { name: 'Wayag', kabupatenKota: ['Kabupaten Raja Ampat'] },
    ],
  },
  {
    kode: 'BYP',
    name: 'Borobudur-Yogyakarta-Prambanan',
    kta: [
      { name: 'KTA Borobudur', kabupatenKota: ['Kabupaten Magelang'] },
      { name: 'KTA Yogyakarta', kabupatenKota: ['Kota Yogyakarta', 'Kabupaten Bantul'] },
      { name: 'KTA Prambanan', kabupatenKota: ['Kabupaten Sleman', 'Kabupaten Klaten'] },
    ],
  },
  {
    kode: 'TOBA',
    name: 'Danau Toba',
    kta: [
      { name: 'Parapat', kabupatenKota: ['Kabupaten Simalungun', 'Kabupaten Toba'] },
      { name: 'Simanindo', kabupatenKota: ['Kabupaten Samosir'] },
      { name: 'Pangururan', kabupatenKota: ['Kabupaten Samosir'] },
      { name: 'Balige', kabupatenKota: ['Kabupaten Toba'] },
      { name: 'Muara', kabupatenKota: ['Kabupaten Tapanuli Utara', 'Kabupaten Humbang Hasundutan'] },
      { name: 'Merek', kabupatenKota: ['Kabupaten Karo', 'Kabupaten Dairi'] },
    ],
  },
  {
    kode: 'BAJO',
    name: 'Labuan Bajo',
    kta: [
      { name: 'Taman Nasional Komodo', kabupatenKota: ['Kabupaten Manggarai Barat'] },
      { name: 'Labuan Bajo dan sekitarnya', kabupatenKota: ['Kabupaten Manggarai Barat'] },
    ],
  },
  {
    kode: 'BTS',
    name: 'Bromo-Tengger-Semeru',
    kta: [
      { name: 'Tosari', kabupatenKota: ['Kabupaten Pasuruan'] },
      { name: 'Sukapura', kabupatenKota: ['Kabupaten Probolinggo'] },
      { name: 'Senduro', kabupatenKota: ['Kabupaten Lumajang'] },
      { name: 'Poncokusumo', kabupatenKota: ['Kabupaten Malang'] },
      { name: 'Klojen-Blimbing', kabupatenKota: ['Kota Malang'] },
    ],
  },
  {
    kode: 'WKTB',
    name: 'Wakatobi',
    kta: [
      { name: 'Wangi-Wangi', kabupatenKota: ['Kabupaten Wakatobi'] },
      { name: 'Kaledupa', kabupatenKota: ['Kabupaten Wakatobi'] },
      { name: 'Tomia', kabupatenKota: ['Kabupaten Wakatobi'] },
      { name: 'Binongki', kabupatenKota: ['Kabupaten Wakatobi'] },
    ],
  },
  {
    kode: 'MORO',
    name: 'Morotai',
    kta: [
      { name: 'Moro Point', kabupatenKota: ['Kabupaten Pulau Morotai'] },
      { name: 'Rao', kabupatenKota: ['Kabupaten Pulau Morotai'] },
      { name: 'Pasifik', kabupatenKota: ['Kabupaten Pulau Morotai'] },
    ],
  },
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim()
}

export async function up(queryInterface: QueryInterface) {
  const dpns = await queryInterface.sequelize.query<{ dpn_id: number; kode: string; nama_dpn: string }>(
    'SELECT dpn_id, kode, nama_dpn FROM dpn',
    { type: QueryTypes.SELECT }
  )
  const dpnByCode = new Map(dpns.map((dpn) => [String(dpn.kode).toUpperCase(), dpn]))
  const dpnByName = new Map(dpns.map((dpn) => [normalize(String(dpn.nama_dpn)), dpn]))
  const rows = ktaSeeds.flatMap((destination) => {
    const dpn = dpnByCode.get(destination.kode.toUpperCase()) || dpnByName.get(normalize(destination.name))
    if (!dpn) return []

    return destination.kta.map((kta, index) => ({
      dpn_id: dpn.dpn_id,
      nama_kta: kta.name,
      kabupaten_kota: JSON.stringify(kta.kabupatenKota),
      nomor_urut: index + 1,
      created_at: new Date(),
      updated_at: new Date(),
    }))
  })

  await queryInterface.bulkDelete('kta_area', {}, {})
  if (rows.length) {
    await queryInterface.bulkInsert('kta_area', rows)
  }
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('kta_area', {}, {})
}
