import { IsUUID } from 'class-validator'

export class GetTeamRequest {
  @IsUUID('7', { message: 'Invalid team id' })
  readonly teamId!: string
}
