import express, { Request, Response } from 'express'
import { z } from 'zod'
import { asyncHandler } from '~/lib/async-handler'
import PageExportService from '../service/page-export'

const route = express.Router()
const service = new PageExportService()

const exportSchema = z.object({
  path: z.string().min(1),
  format: z.enum(['pdf', 'jpg']).default('pdf'),
})

route.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const values = exportSchema.parse(req.body)
    const result = await service.exportPage({
      path: values.path,
      format: values.format,
      cookieHeader: req.headers.cookie,
    })
    const filename = `${values.path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.${result.extension}`

    res.setHeader('Content-Type', result.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.status(200).send(result.buffer)
  })
)

export { route as PageExportHandler }
