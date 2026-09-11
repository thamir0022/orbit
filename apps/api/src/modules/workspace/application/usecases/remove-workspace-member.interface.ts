import { RemoveWorkspaceMemberInput } from '../dtos'

export interface IRemoveWorkspaceMemberUseCase {
  execute(input: RemoveWorkspaceMemberInput): Promise<void>
}

export const REMOVE_WORKSPACE_MEMBER = Symbol('IRemoveWorkspaceMemberUseCase')
