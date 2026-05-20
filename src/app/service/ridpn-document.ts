import { Includeable, Model, ModelStatic } from 'sequelize'
import Dpn from '../database/entity/dpn'
import RidpnDocument from '../database/entity/ridpn-document'
import { ridpnDocumentSchema } from '../database/schema/ridpn-document'
import BaseService from './base'
import { DtoFindAll, FindParams } from './types'
import { useQuery } from '~/lib/query-builder'

type RidpnDocumentModel = RidpnDocument & Model

const documentIncludes: Includeable[] = [
  {
    model: Dpn,
    as: 'dpn',
  },
]

export default class RidpnDocumentService extends BaseService<RidpnDocumentModel> {
  constructor() {
    super({
      repository: RidpnDocument as unknown as ModelStatic<RidpnDocumentModel>,
      schema: ridpnDocumentSchema,
      model: 'ridpn document',
    })
  }

  async find({ page, pageSize, filtered = [], sorted = [] }: FindParams): Promise<DtoFindAll<RidpnDocumentModel>> {
    const query = useQuery({
      model: this.repository,
      reqQuery: { page, pageSize, filtered, sorted },
      includeRule: [],
    })

    const data = await this.repository.findAll({
      ...query,
      include: documentIncludes,
      order: query.order ? query.order : [['created_at', 'desc']],
    })

    const total = await this.repository.count({
      where: query.where,
    })

    return { data, total }
  }

  async findById(id: string): Promise<RidpnDocumentModel> {
    return super.findById(id, { include: documentIncludes, rejectOnEmpty: true })
  }
}
