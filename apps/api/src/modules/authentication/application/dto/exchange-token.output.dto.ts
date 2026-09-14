import { WorkspaceDto } from '@/shared/domain/types'

export interface ExchangeTokenOutputDto {
  workspace?: WorkspaceDto
  accessToken: string
  expiresIn: Date
}
