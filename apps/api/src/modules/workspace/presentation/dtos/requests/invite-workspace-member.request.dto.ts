import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator'
import { Transform } from 'class-transformer'

export class InviteWorkspaceMemberRequest {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value
  )
  @IsNotEmpty()
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsNotEmpty()
  @IsUUID(undefined, { message: 'Invalid role ID' })
  roleId!: string
}
