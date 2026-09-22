import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class RevokeSessionRequestDto {
  @IsString({ message: 'Session id is required' })
  @IsNotEmpty({ message: 'Invalid session id' })
  @IsUUID('7', { message: 'Invalid session id' })
  readonly publicId!: string
}
