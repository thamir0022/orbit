import { CreateWorkItemInput } from './create-work-item.input'
import { CreateWorkItemOutput } from './create-work-item.output'

export interface ICreateWorkItemUseCase {
  execute(input: CreateWorkItemInput): Promise<CreateWorkItemOutput>
}

export const CREATE_WORK_ITEM_USE_CASE = Symbol('CreateWorkItemUseCase')
