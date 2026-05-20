import express, { Request, Response } from 'express'
import swaggerUI from 'swagger-ui-express'
import { env } from '~/config/env'
import { optionsSwaggerUI, swaggerSpec } from '~/lib/swagger'
import { AuthHandler } from '../handler/auth'
import { DpnHandler } from '../handler/dpn'
import { KtaAreaHandler } from '../handler/kta-area'
import { LegacyBackupHandler } from '../handler/legacy-backup'
import { MonevPhaseHandler } from '../handler/monev-phase'
import { RencanaAksiHandler } from '../handler/rencana-aksi'
import { RidpnDocumentHandler } from '../handler/ridpn-document'
import { RoleHandler } from '../handler/role'
import { SessionHandler } from '../handler/session'
import { UploadHandler } from '../handler/upload'
import { UserHandler } from '../handler/user'

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

route.use('/role', RoleHandler)
route.use('/session', SessionHandler)
route.use('/upload', UploadHandler)
route.use('/user', UserHandler)
route.use('/auth', AuthHandler)
route.use('/dpn', DpnHandler)
route.use('/kta-area', KtaAreaHandler)
route.use('/ridpn-document', RidpnDocumentHandler)
route.use('/rencana-aksi', RencanaAksiHandler)
route.use('/monev-phase', MonevPhaseHandler)
route.use('/legacy', LegacyBackupHandler)

export { route as v1Route }
