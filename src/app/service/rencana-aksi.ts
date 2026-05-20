import { Model, ModelStatic } from 'sequelize'
import { useQuery } from '~/lib/query-builder'
import RencanaAksi from '../database/entity/rencana-aksi'
import { rencanaAksiSchema } from '../database/schema/rencana-aksi'
import BaseService from './base'
import { DtoFindAll, FindParams } from './types'

type RencanaAksiModel = RencanaAksi & Model

export default class RencanaAksiService extends BaseService<RencanaAksiModel> {
  constructor() {
    super({
      repository: RencanaAksi as unknown as ModelStatic<RencanaAksiModel>,
      schema: rencanaAksiSchema,
      model: 'rencana aksi',
    })
  }

  async find({ page, pageSize, filtered = [], sorted = [] }: FindParams): Promise<DtoFindAll<RencanaAksiModel>> {
    const query = useQuery({
      model: this.repository,
      reqQuery: { page, pageSize, filtered, sorted },
      includeRule: [],
    })

    const data = await this.repository.findAll({
      ...query,
      order: query.order ? query.order : [['no_ra', 'asc']],
    })

    const total = await this.repository.count({
      where: query.where,
    })

    return { data, total }
  }
}
