import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import RidpnActionService from '../service/ridpn-action'

const route = express.Router()
const service = new RidpnActionService()

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

route.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const record = await service.save(req.getBody())
    const httpResponse = HttpResponse.created({ data: record })
    res.status(201).json(httpResponse)
  })
)

route.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const record = await service.save(req.getBody(), id)
    const httpResponse = HttpResponse.updated({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    await service.delete(id)
    const httpResponse = HttpResponse.deleted({})
    res.status(200).json(httpResponse)
  })
)

export { route as RidpnActionHandler }
