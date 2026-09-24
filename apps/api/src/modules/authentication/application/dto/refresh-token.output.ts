import { WorkspaceDto } from '@/shared/domain/types'

export interface RefreshTokenOutput {
  workspace?: WorkspaceDto
  accessToken: string
  expiresIn: Date
}
