import express, { Request, Response } from 'express'
import { allowed_pdf } from '~/lib/constant/upload/allowed-extension'
import { Mimetype } from '~/lib/constant/upload/allowed-mimetypes'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import { useMulter } from '~/lib/upload/multer'
import ManagementReportService from '../service/management-report'
import NotificationService, { type CurrentUser } from '../service/notification'

const route = express.Router()
const service = new ManagementReportService()
const notificationService = new NotificationService()
const mimetype = new Mimetype()
const upload = useMulter({
  allowed_ext: allowed_pdf,
  allowed_mimetype: mimetype.pdf,
  limit: { file_size: 10 * 1024 * 1024 },
})

async function getOptionalActor(req: Request): Promise<CurrentUser | null> {
  try {
    return await notificationService.getCurrentUser(req)
  } catch (_error) {
    return null
  }
}

route.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', pageSize = '5000', search = '' } = req.getQuery()
    const records = await service.list({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 5000,
      search: String(search || ''),
    })
    res.status(200).json(HttpResponse.get({ data: records }))
  })
)

route.get(
  '/stakeholder-options',
  asyncHandler(async (_req: Request, res: Response) => {
    const records = await service.stakeholderOptions()
    res.status(200).json(HttpResponse.get({ data: { data: records, total: records.length } }))
  })
)

route.post(
  '/stakeholder-options',
  asyncHandler(async (req: Request, res: Response) => {
    const record = await service.createStakeholderOption(req.body)
    res.status(201).json(HttpResponse.created({ data: record }))
  })
)

route.get(
  '/pelaksana-options',
  asyncHandler(async (_req: Request, res: Response) => {
    const records = await service.pelaksanaOptions()
    res.status(200).json(HttpResponse.get({ data: { data: records, total: records.length } }))
  })
)

route.post(
  '/',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const actor = await getOptionalActor(req)
    const record = await service.save(req.body, req.file, undefined, actor)
    res.status(201).json(HttpResponse.created({ data: record }))
  })
)

route.put(
  '/:id',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const actor = await getOptionalActor(req)
    const record = await service.save(req.body, req.file, id, actor)
    res.status(200).json(HttpResponse.updated({ data: record }))
  })
)

route.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const actor = await getOptionalActor(req)
    await service.remove(id, actor)
    res.status(200).json(HttpResponse.deleted({ data: {} }))
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

export { route as ManagementReportHandler }
