import express, { Request, Response } from 'express'
import swaggerUI from 'swagger-ui-express'
import { env } from '~/config/env'
import { optionsSwaggerUI, swaggerSpec } from '~/lib/swagger'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import { AuthHandler } from '../handler/auth'
import { CsvDataHandler, createCsvTableHandler } from '../handler/csv-data'
import { MonevPhaseHandler } from '../handler/monev-phase'
import { ManagementReportHandler } from '../handler/management-report'
import { NotificationHandler } from '../handler/notification'
import { KtaAreaHandler } from '../handler/kta-area'
import { PageExportHandler } from '../handler/page-export'
import { RidpnActionHandler } from '../handler/ridpn-action'
import { RidpnDocumentHandler } from '../handler/ridpn-document'
import { RidpnMonevHandler } from '../handler/ridpn-monev'
import { UserManagementHandler } from '../handler/user-management'

const route = express.Router()

function docsSwagger() {
  route.get('/swagger.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })

  route.use('/api-docs', swaggerUI.serve)
  route.get('/api-docs', swaggerUI.setup(swaggerSpec, optionsSwaggerUI))
}

// docs swagger disable for production mode
if (env.NODE_ENV !== 'production') {
  docsSwagger()
}

route.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const httpResponse = HttpResponse.get({ data: 'API v1 is ready. CSV data is available under /v1/data.' })
    res.status(200).json(httpResponse)
  })
)

route.use('/data', CsvDataHandler)
route.use('/auth', AuthHandler)
route.use('/users', UserManagementHandler)
route.use('/monev-phase', MonevPhaseHandler)
route.use('/management-report', ManagementReportHandler)
route.use('/notifications', NotificationHandler)
route.use('/export', PageExportHandler)
route.use('/kta-area', KtaAreaHandler)
route.use('/ridpn-actions', RidpnActionHandler)
route.use('/ridpn-documents', RidpnDocumentHandler)
route.use('/ridpn-monev', RidpnMonevHandler)
route.use('/tahun', createCsvTableHandler('tahun'))
route.use('/dpn', createCsvTableHandler('dpn'))
route.use('/jenis-pelaksana', createCsvTableHandler('jenis_pelaksana'))
route.use('/komponen', createCsvTableHandler('komponen'))
route.use('/perpres', createCsvTableHandler('perpres'))
route.use('/perpres-dpn-tahap', createCsvTableHandler('perpres_dpn_tahap'))
route.use('/stakeholder', createCsvTableHandler('stakeholder'))
route.use('/stakeholder-dpn', createCsvTableHandler('stakeholder_dpn'))
route.use('/pelaksana', createCsvTableHandler('pelaksana'))
route.use('/kegiatan', createCsvTableHandler('kegiatan'))
route.use('/kegiatan-tahun', createCsvTableHandler('kegiatan_tahun'))
route.use('/kegiatan-pelaksana', createCsvTableHandler('kegiatan_pelaksana'))
route.use('/laporan-monev', createCsvTableHandler('laporan_monev'))
route.use('/file-pelaporan', createCsvTableHandler('file_pelaporan'))
route.use('/kta-area-data', createCsvTableHandler('kta_area'))

export { route as v1Route }
