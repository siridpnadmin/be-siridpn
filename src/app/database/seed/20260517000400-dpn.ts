'use strict'

import { DataTypes, QueryInterface } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'

const dpnRows = [
  {
    dpn_id: 5,
    kode: 'TOBA',
    nama_dpn: 'Danau Toba',
    lat_pusat: 2.419249,
    long_pusat: 98.96747,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/danautoba.jpeg',
  },
  {
    dpn_id: 2,
    kode: 'BABEL',
    nama_dpn: 'Bangka Belitung',
    lat_pusat: -2.5745278,
    long_pusat: 106.2625771,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/bebel.jpeg',
  },
  {
    dpn_id: 3,
    kode: 'BYP',
    nama_dpn: 'Borobudur-Yogyakarta-Prambanan',
    lat_pusat: -7.493141997950513,
    long_pusat: 110.18883053056403,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/byp.jpeg',
  },
  {
    dpn_id: 4,
    kode: 'BTS',
    nama_dpn: 'Bromo-Tengger-Semeru',
    lat_pusat: -8.026418219550298,
    long_pusat: 112.9600597,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/bts.jpeg',
  },
  {
    dpn_id: 6,
    kode: 'LMBK',
    nama_dpn: 'Lombok-Gili Tramena',
    lat_pusat: -8.569065764792915,
    long_pusat: 116.38678926814512,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/lmbkgili.jpeg',
  },
  {
    dpn_id: 1,
    kode: 'BAJO',
    nama_dpn: 'Labuan Bajo',
    lat_pusat: -8.649541,
    long_pusat: 119.514104,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/bajo.jpeg',
  },
  {
    dpn_id: 10,
    kode: 'WKTB',
    nama_dpn: 'Wakatobi',
    lat_pusat: -5.640307677468884,
    long_pusat: 123.83509449055883,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/wakatobi.jpeg',
  },
  {
    dpn_id: 7,
    kode: 'MND',
    nama_dpn: 'Manado-Likupang',
    lat_pusat: 1.4790373162587025,
    long_pusat: 124.8586411672774,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/manli.jpeg',
  },
  {
    dpn_id: 8,
    kode: 'MORO',
    nama_dpn: 'Morotai',
    lat_pusat: 2.328410059942571,
    long_pusat: 128.44814960209388,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/morotai.jpeg',
  },
  {
    dpn_id: 9,
    kode: 'R4',
    nama_dpn: 'Raja Ampat',
    lat_pusat: 0.16499116644447456,
    long_pusat: 130.03731988273077,
    public_thumbnail:
      'https://owhwqfalqfuduxgymwpv.supabase.co/storage/v1/object/public/10dpp-images/public/r4.jpeg',
  },
]

export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  const now = new Date()
  await queryInterface.bulkInsert(
    'dpn',
    dpnRows.map((row) => ({
      id: uuidv4(),
      ...row,
      created_at: now,
      updated_at: now,
    }))
  )
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.bulkDelete('dpn', {
    kode: dpnRows.map((row) => row.kode),
  })
}
