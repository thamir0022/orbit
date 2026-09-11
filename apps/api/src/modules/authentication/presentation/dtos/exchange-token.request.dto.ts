import { IsOptional, IsString } from 'class-validator'

export class ExchnageTokenRequestDto {
  @IsString()
  @IsOptional()
  slug?: string
}
