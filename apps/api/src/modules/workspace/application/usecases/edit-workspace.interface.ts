import { EditWorkspaceInput, EditWorkspaceOutput } from '../dtos'

export interface IEditWorkspaceUseCase {
  execute(input: EditWorkspaceInput): Promise<EditWorkspaceOutput>
}

export const EDIT_WORKSPACE = Symbol('EDIT_WORKSPACE')
