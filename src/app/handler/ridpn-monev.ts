import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import { allowed_excel, allowed_pdf } from '~/lib/constant/upload/allowed-extension'
import { Mimetype } from '~/lib/constant/upload/allowed-mimetypes'
import HttpResponse from '~/lib/http/response'
import { useMulter } from '~/lib/upload/multer'
import RidpnMonevService from '../service/ridpn-monev'
import NotificationService, { type CurrentUser } from '../service/notification'

const route = express.Router()
const service = new RidpnMonevService()
const notificationService = new NotificationService()
const mimetype = new Mimetype()
const upload = useMulter({
  allowed_ext: [...allowed_pdf, ...allowed_excel],
  allowed_mimetype: [...mimetype.pdf, ...mimetype.spreadsheet],
  limit: { file_size: 5 * 1024 * 1024 },
})

route.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { perpres_dpn_tahap_id } = req.getQuery()
    const records = perpres_dpn_tahap_id ? await service.list(perpres_dpn_tahap_id as string) : []
    const httpResponse = HttpResponse.get({
      data: {
        data: records,
        total: records.length,
      },
    })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/contributors',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await notificationService.getCurrentUser(req)
    const records = await service.contributors(user)
    const httpResponse = HttpResponse.get({
      data: {
        data: records,
        total: records.length,
      },
    })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/',
  upload.single('bukti'),
  asyncHandler(async (req: Request, res: Response) => {
    let actor: CurrentUser | null = null
    try {
      actor = await notificationService.getCurrentUser(req)
    } catch (_error) {
      actor = null
    }

    const record = await service.save(req.body, req.file, actor)
    const httpResponse = HttpResponse.updated({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/:id/download',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const { response, contentType, filename } = await service.getDownload(id)
    const arrayBuffer = await response.arrayBuffer()

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '')}"`)
    res.send(Buffer.from(arrayBuffer))
  })
)

export { route as RidpnMonevHandler }
