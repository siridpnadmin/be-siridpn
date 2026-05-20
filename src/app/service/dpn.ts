import { Model, ModelStatic } from 'sequelize'
import Dpn from '../database/entity/dpn'
import { dpnSchema } from '../database/schema/dpn'
import BaseService from './base'
import { FindParams, DtoFindAll } from './types'
import { useQuery } from '~/lib/query-builder'

type DpnModel = Dpn & Model

export default class DpnService extends BaseService<DpnModel> {
  constructor() {
    super({
      repository: Dpn as unknown as ModelStatic<DpnModel>,
      schema: dpnSchema,
      model: 'dpn',
    })
  }

  async find({ page, pageSize, filtered = [], sorted = [] }: FindParams): Promise<DtoFindAll<DpnModel>> {
    const query = useQuery({
      model: this.repository,
      reqQuery: { page, pageSize, filtered, sorted },
      includeRule: [],
    })

    const data = await this.repository.findAll({
      ...query,
      order: query.order ? query.order : [['dpn_id', 'asc']],
    })

    const total = await this.repository.count({
      include: query.includeCount,
      where: query.where,
    })

    return { data, total }
  }
}
