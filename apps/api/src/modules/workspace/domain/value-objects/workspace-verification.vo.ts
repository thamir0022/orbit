import { ValueObject } from '@/shared/domain'
import { VerificationStatus } from '../enums/workspace-verification.enum'

export interface WorkspaceVerificationProps {
  status: VerificationStatus
  verifiedAt?: Date
}

interface RawWorkspaceVerificationProps {
  status: string
  verifiedAt?: Date
}

export class WorkspaceVerification extends ValueObject<WorkspaceVerificationProps> {
  static createDefault(): WorkspaceVerification {
    return new WorkspaceVerification({
      status: VerificationStatus.PENDING,
    })
  }

  static verify(): WorkspaceVerification {
    return new WorkspaceVerification({
      status: VerificationStatus.VERIFIED,
      verifiedAt: new Date(),
    })
  }

  static fromPersistence(
    raw: RawWorkspaceVerificationProps
  ): WorkspaceVerification {
    return new WorkspaceVerification({
      status: raw.status as VerificationStatus,
      verifiedAt: raw.verifiedAt,
    })
  }

  toPersistence() {
    return {
      status: this.props.status,
      verifiedAt: this.props.verifiedAt,
    }
  }

  toPrimitives() {
    return {
      status: this.props.status,
      verifiedAt: this.props.verifiedAt,
    }
  }

  isVerified(): boolean {
    return this.props.status === VerificationStatus.VERIFIED
  }
}
