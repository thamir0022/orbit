import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateWorkspaceRoleRequest {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name!: string

  @IsOptional()
  @MaxLength(100)
  description?: string

  @IsNotEmpty()
  @IsArray()
  permissionIds!: string[]
}
