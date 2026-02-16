import { ValueObject } from '@/shared/domain'
import { VerificationStatus } from '../enums/organization-verification.enum'

export interface OrganizationVerificationProps {
  status: VerificationStatus
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

  isVerified(): boolean {
    return this.props.status === VerificationStatus.VERIFIED
  }
}
