import { IsOptional, IsString } from 'class-validator'

export class RefreshTokenRequest {
  @IsOptional()
  @IsString()
  readonly slug?: string
}
