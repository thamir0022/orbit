import { WorkspaceListItem } from '@/modules/workspace/application/model/workspaces-list'

export interface SignInOutputDto {
  refreshToken: string
  expiresIn: Date
  workspaces: WorkspaceListItem[]
}
