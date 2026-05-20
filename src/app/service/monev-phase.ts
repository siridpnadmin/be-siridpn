import { Model, ModelStatic } from 'sequelize'
import MonevPhase from '../database/entity/monev-phase'
import { monevPhaseSchema } from '../database/schema/monev-phase'
import BaseService from './base'

type MonevPhaseModel = MonevPhase & Model

export default class MonevPhaseService extends BaseService<MonevPhaseModel> {
  constructor() {
    super({
      repository: MonevPhase as unknown as ModelStatic<MonevPhaseModel>,
      schema: monevPhaseSchema,
      model: 'monev phase',
    })
  }
}
