import { RoleStatus } from '@/modules/authorization/domain/enums/role-status.enum'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateWorkspaceRoleRequest {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  name!: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string

  @IsOptional()
  @IsEnum(RoleStatus, { message: 'Invalid role status' })
  status!: RoleStatus

  @IsNotEmpty()
  @IsArray()
  permissionIds!: string[]
}
