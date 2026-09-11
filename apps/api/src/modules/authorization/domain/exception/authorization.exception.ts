import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'
import { RoleName } from '../value-objects/role-name.vo'

export class RoleNotFoundException extends DomainException {
  constructor(identifier?: string) {
    super({
      code: 'ROLE_NOT_FOUND',
      message: identifier
        ? `Role with identifier ${identifier} not found`
        : 'Role not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class PermissionNotFoundException extends DomainException {
  constructor(identifier?: string) {
    super({
      code: 'PERMISSION_NOT_FOUND',
      message: identifier
        ? `Permission with identifier ${identifier} not found`
        : 'Permission not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class RoleAlreadyExistsException extends DomainException {
  constructor(roleName: RoleName) {
    super({
      code: 'ROLE_ALREADY_EXISTS',
      message: `Role '${roleName.value}' already exists in this workspace`,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}

export class PermissionAlreadyAssignedException extends DomainException {
  constructor() {
    super({
      code: 'PERMISSION_ALREADY_ASSIGNED',
      message: 'Permission is already assigned to this role',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}

export class PermissionNotAssignedException extends DomainException {
  constructor() {
    super({
      code: 'PERMISSION_NOT_ASSIGNED',
      message: 'Permission is not assigned to this role',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class SystemRoleModificationException extends DomainException {
  constructor() {
    super({
      code: 'SYSTEM_ROLE_MODIFICATION_DENIED',
      message: 'System roles cannot be modified',
      statusCode: HttpStatus.FORBIDDEN,
    })
  }
}

export class SystemRoleDeletionException extends DomainException {
  constructor() {
    super({
      code: 'SYSTEM_ROLE_DELETION_DENIED',
      message: 'System roles cannot be deleted',
      statusCode: HttpStatus.FORBIDDEN,
    })
  }
}

export class InsufficientPermissionsException extends DomainException {
  constructor(permission?: string) {
    super({
      code: 'INSUFFICIENT_PERMISSIONS',
      message: permission
        ? `Missing required permission: ${permission}`
        : 'You do not have permission to perform this action',
      statusCode: HttpStatus.FORBIDDEN,
    })
  }
}

export class InvalidPermissionKeyException extends DomainException {
  constructor(message: string) {
    super({
      code: 'INVALID_PERMISSION_KEY',
      message,
    })
  }
}

export class InvalidPermissionException extends DomainException {
  constructor() {
    super({
      code: 'INVALID_PERMISSION_KEY',
      message: 'Invalid permission',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}

export class InvalidRoleNameException extends DomainException {
  constructor(message: string) {
    super({
      code: 'INVALID_ROLE_NAME',
      message,
    })
  }
}

export class PlatformAdminAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super({
      code: 'PLATFORM_ADMIN_ALREADY_EXISTS',
      message: `${email} is already a platform administrator`,
      statusCode: HttpStatus.CONFLICT,
    })
  }
}
