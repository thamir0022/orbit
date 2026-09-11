import { IsNotEmpty, IsString } from 'class-validator'

export class GetWorkspaceInvitationRequest {
  @IsNotEmpty()
  @IsString()
  token!: string
}
