import express, { Request, Response } from 'express'
import { asyncHandler } from '~/lib/async-handler'
import HttpResponse from '~/lib/http/response'
import type { QueryFilters, QuerySorts } from '~/lib/query-builder/types'
import CsvDataService from '../service/csv-data'

const route = express.Router()
const service = new CsvDataService()

function registerTableRoutes(router: express.Router, fixedTable?: string) {
  const tablePath = fixedTable ? '' : '/:table'
  const recordPath = fixedTable ? '/:id' : '/:table/:id'
  const getTable = (req: Request) => fixedTable || req.getParams().table

  router.get(
    tablePath || '/',
    asyncHandler(async (req: Request, res: Response) => {
      const table = getTable(req)
      const { page, pageSize, filtered, sorted } = req.getQuery()
      const records = await service.find(table, {
        page,
        pageSize,
        filtered: filtered as QueryFilters[] | undefined,
        sorted: sorted as QuerySorts[] | undefined,
      })
      const httpResponse = HttpResponse.get({ data: records })
      res.status(200).json(httpResponse)
    })
  )

  router.get(
    recordPath,
    asyncHandler(async (req: Request, res: Response) => {
      const table = getTable(req)
      const { id } = req.getParams()
      const record = await service.findById(table, id)
      const httpResponse = HttpResponse.get({ data: record })
      res.status(200).json(httpResponse)
    })
  )

  router.post(
    tablePath || '/',
    asyncHandler(async (req: Request, res: Response) => {
      const table = getTable(req)
      const record = await service.create(table, req.getBody())
      const httpResponse = HttpResponse.created({ data: record })
      res.status(201).json(httpResponse)
    })
  )

  router.put(
    recordPath,
    asyncHandler(async (req: Request, res: Response) => {
      const table = getTable(req)
      const { id } = req.getParams()
      const record = await service.update(table, id, req.getBody())
      const httpResponse = HttpResponse.updated({ data: record })
      res.status(200).json(httpResponse)
    })
  )

  router.delete(
    recordPath,
    asyncHandler(async (req: Request, res: Response) => {
      const table = getTable(req)
      const { id } = req.getParams()
      await service.delete(table, id)
      const httpResponse = HttpResponse.deleted({})
      res.status(200).json(httpResponse)
    })
  )
}

route.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const httpResponse = HttpResponse.get({ data: service.listTables() })
    res.status(200).json(httpResponse)
  })
)

registerTableRoutes(route)

export function createCsvTableHandler(table: string) {
  const tableRoute = express.Router()
  registerTableRoutes(tableRoute, table)
  return tableRoute
}

export { route as CsvDataHandler }
