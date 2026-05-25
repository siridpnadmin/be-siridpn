import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import KtaAreaService from '../service/kta-area'

const route = express.Router()
const service = new KtaAreaService()

route.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { page = '1', pageSize = '1000', dpn_id, search = '' } = req.getQuery()
    const records = await service.list({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 1000,
      dpnId: dpn_id,
      search: String(search || ''),
    })
    res.status(200).json(HttpResponse.get({ data: records }))
  })
)

route.get(
  '/dpn/:dpnId',
  asyncHandler(async (req: Request, res: Response) => {
    const { dpnId } = req.getParams()
    const records = await service.listByDpn(dpnId)
    res.status(200).json(HttpResponse.get({ data: records }))
  })
)

export { route as KtaAreaHandler }
