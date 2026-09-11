import { WorkspaceMemberStatus } from '@/modules/workspace/domain'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'

export class UpdateWorkspaceMemberRequest {
  @IsOptional()
  @IsUUID('7', { message: 'Invalid role id' })
  readonly roleId?: string

  @IsOptional()
  @IsEnum(WorkspaceMemberStatus, { message: 'Invalid member status' })
  readonly status?: WorkspaceMemberStatus
}
