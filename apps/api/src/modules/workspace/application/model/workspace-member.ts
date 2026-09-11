import { WorkspaceMemberStatus } from '../../domain'

export interface WorkspaceMemberDto {
  readonly id: string

  readonly displayName: string

  readonly email: string

  readonly avatarUrl: string | null

  readonly roleName: string

  readonly roleId: string

  readonly status: WorkspaceMemberStatus

  readonly joinedAt: Date | null
}
