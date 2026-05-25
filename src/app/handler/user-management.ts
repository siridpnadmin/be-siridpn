import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import type { QueryFilters, QuerySorts } from '~/lib/query-builder/types'
import UserManagementService from '../service/user-management'

const route = express.Router()
const service = new UserManagementService()

route.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { page, pageSize, filtered, sorted } = req.getQuery()
    const records = await service.find({
      page,
      pageSize,
      filtered: filtered as QueryFilters[] | undefined,
      sorted: sorted as QuerySorts[] | undefined,
    })
    const httpResponse = HttpResponse.get({ data: records })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/roles',
  asyncHandler(async (_req: Request, res: Response) => {
    const roles = await service.roles()
    const httpResponse = HttpResponse.get({ data: roles })
    res.status(200).json(httpResponse)
  })
)

route.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const record = await service.findById(id)
    const httpResponse = HttpResponse.get({ data: record })
    res.status(200).json(httpResponse)
  })
)

route.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const record = await service.create(req.getBody())
    const httpResponse = HttpResponse.created({ data: record })
    res.status(201).json(httpResponse)
  })
)

route.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.getParams()
    const record = await service.update(id, req.getBody())
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

export { route as UserManagementHandler }
