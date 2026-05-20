import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import LegacyBackupService from '../service/legacy-backup'

const route = express.Router()
const service = new LegacyBackupService()

route.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const httpResponse = HttpResponse.get({ data: service.listTables() })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/rencana-aksi',
  asyncHandler(async (req: Request, res: Response) => {
    const values = req.getBody()
    const record = await service.createRencanaAksi(values)
    const httpResponse = HttpResponse.created({ data: record })
    res.status(201).json(httpResponse)
  })
)

route.put(
  '/rencana-aksi/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const values = req.getBody()
    const record = await service.updateRencanaAksi(id, values)
    const httpResponse = HttpResponse.updated({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.delete(
  '/rencana-aksi/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    await service.deleteRencanaAksi(id)
    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/file-pelaporan',
  asyncHandler(async (req: Request, res: Response) => {
    const values = req.getBody()
    const record = await service.createFilePelaporan(values)
    const httpResponse = HttpResponse.created({ data: record })
    res.status(201).json(httpResponse)
  })
)

route.put(
  '/file-pelaporan/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const values = req.getBody()
    const record = await service.updateFilePelaporan(id, values)
    const httpResponse = HttpResponse.updated({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.delete(
  '/file-pelaporan/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    await service.deleteFilePelaporan(id)
    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/:table',
  asyncHandler(async (req: Request, res: Response) => {
    const { table } = req.getParams()
    const { page, pageSize, filtered, sorted } = req.getQuery()
    const records = await service.find(table, { page, pageSize, filtered, sorted })
    const httpResponse = HttpResponse.get({ data: records })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/:table/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { table, id } = req.getParams()
    const record = await service.findById(table, id)
    const httpResponse = HttpResponse.get({ data: record })
    res.status(200).json(httpResponse)
  })
)

export { route as LegacyBackupHandler }
