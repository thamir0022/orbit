import { ValueObject } from '@/shared/domain'
import { VerificationStatus } from '../enums/organization-verification.enum'

export interface OrganizationVerificationProps {
  status: VerificationStatus
  verifiedAt?: Date
}

interface RawOrganizationVerificationProps {
  status: string
  verifiedAt?: Date
}

export class OrganizationVerification extends ValueObject<OrganizationVerificationProps> {
  static createDefault(): OrganizationVerification {
    return new OrganizationVerification({
      status: VerificationStatus.PENDING,
    })
  }

  static verify(): OrganizationVerification {
    return new OrganizationVerification({
      status: VerificationStatus.VERIFIED,
      verifiedAt: new Date(),
    })
  }

  static fromPersistence(
    raw: RawOrganizationVerificationProps
  ): OrganizationVerification {
    return new OrganizationVerification({
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

  isVerified(): boolean {
    return this.props.status === VerificationStatus.VERIFIED
  }
}
