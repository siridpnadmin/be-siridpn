import { Model, ModelStatic } from 'sequelize'
import { useQuery } from '~/lib/query-builder'
import Dpn from '../database/entity/dpn'
import KtaArea from '../database/entity/kta-area'
import { ktaAreaSchema } from '../database/schema/kta-area'
import BaseService from './base'
import { DtoFindAll, FindParams } from './types'

type KtaAreaModel = KtaArea & Model

const includeRule = [
  {
    model: Dpn,
    as: 'dpn',
  },
]

export default class KtaAreaService extends BaseService<KtaAreaModel> {
  constructor() {
    super({
      repository: KtaArea as unknown as ModelStatic<KtaAreaModel>,
      schema: ktaAreaSchema,
      model: 'kta area',
    })
  }

  async find({ page, pageSize, filtered = [], sorted = [] }: FindParams): Promise<DtoFindAll<KtaAreaModel>> {
    const query = useQuery({
      model: this.repository,
      reqQuery: { page, pageSize, filtered, sorted },
      includeRule,
    })

    const data = await this.repository.findAll({
      ...query,
      order: query.order ? query.order : [['nomor_urut', 'asc']],
    })

    const total = await this.repository.count({
      include: query.includeCount,
      where: query.where,
    })

    return { data, total }
  }

  async findById(id: string): Promise<KtaAreaModel> {
    return super.findById(id, { include: includeRule, rejectOnEmpty: true })
  }
}
