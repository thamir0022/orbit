import { DomainException } from '@/shared/domain'
import { HttpStatus } from '@nestjs/common'

export class WorkspaceAlreadyExistsException extends DomainException {
  constructor(slug?: string) {
    super({
      code: 'WORKSPACE_ALREADY_EXISTS',
      message: slug
        ? `Workspace with slug '${slug}' already exists`
        : 'Workspace already exists',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}

export class WorkspaceNotFoundException extends DomainException {
  constructor(slug?: string) {
    super({
      code: 'WORKSPACE_NOT_FOUND',
      message: slug
        ? `Workspace with slug '${slug}' not found`
        : 'Workspace not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class WorkspaceNotActiveException extends DomainException {
  constructor(status?: string) {
    super({
      code: 'WORKSPACE_NOT_ACTIVE',
      message: `Workspace is ${status}, Please contact support`,
      statusCode: HttpStatus.FORBIDDEN,
    })
  }
}

export class WorkspaceInvitationNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'WORKSPACE_INVITATION_NOT_FOUND',
      message: 'Workspace invitation was not found.',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}

export class WorkspaceInvitationAlreadyExistsException extends DomainException {
  constructor() {
    super({
      code: 'WORKSPACE_INVITATION_EXISTS',
      message: 'Workspace invitation already exists',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}

export class WorkspaceInvitationExpiredException extends DomainException {
  constructor() {
    super({
      code: 'WORKSPACE_INVITATION_EXPIRED',
      message: 'This workspace invitation has expired.',
      statusCode: HttpStatus.GONE,
    })
  }
}

export class WorkspaceInvitationAlreadyAcceptedException extends DomainException {
  constructor() {
    super({
      code: 'WORKSPACE_INVITATION_ALREADY_ACCEPTED',
      message: 'This workspace invitation has already been accepted.',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}

export class WorkspaceInvitationRevokedException extends DomainException {
  constructor() {
    super({
      code: 'WORKSPACE_INVITATION_REVOKED',
      message: 'This workspace invitation has been revoked.',
      statusCode: HttpStatus.GONE,
    })
  }
}

export class WorkspaceInvitationDeclinedException extends DomainException {
  constructor() {
    super({
      code: 'WORKSPACE_INVITATION_DECLINED',
      message: 'This workspace invitation has already been declined.',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}

export class UserAlreadyWorkspaceMemberException extends DomainException {
  constructor() {
    super({
      code: 'MEMBER_EXISTS',
      message: 'User already a workspace member',
      statusCode: HttpStatus.CONFLICT,
    })
  }
}

export class WorkspaceInvitationEmailMismatchException extends DomainException {
  constructor() {
    super({
      code: 'INVITATION_EMAIL_MISMATCH',
      message: 'Invitation email mismatch',
      statusCode: HttpStatus.BAD_REQUEST,
    })
  }
}

export class WorkspaceMemberNotFoundException extends DomainException {
  constructor() {
    super({
      code: 'MEMBER_NOT_FOUND',
      message: 'Workspace member not found',
      statusCode: HttpStatus.NOT_FOUND,
    })
  }
}
