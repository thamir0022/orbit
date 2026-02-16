import { Email } from '@/modules/user/domain'
import { ValueObject } from '@/shared/domain'

export interface OrganizationContactProps {
  phone?: string
  email?: Email
  website?: string
  linkedin?: string
  twitter?: string
  github?: string
}

export class OrganizationContact extends ValueObject<OrganizationContactProps> {
  private constructor(props: OrganizationContactProps) {
    super(props)
  }

  static empty(): OrganizationContact {
    return new OrganizationContact({})
  }

  static create(props: OrganizationContactProps): OrganizationContact {
    const normalized: OrganizationContactProps = {
      phone: props.phone?.trim(),
      email: props.email,
      website: props.website?.trim(),
      linkedin: props.linkedin?.trim(),
      twitter: props.twitter?.trim(),
      github: props.github?.trim(),
    }

    if (normalized.phone && !this.validatePhone(normalized.phone)) {
      throw new Error('Invalid phone number format')
    }

    if (normalized.website && !this.validateUrl(normalized.website)) {
      throw new Error('Invalid website URL')
    }

    if (
      normalized.linkedin &&
      !this.validateDomain(normalized.linkedin, 'linkedin.com')
    ) {
      throw new Error('Invalid LinkedIn URL')
    }

    if (
      normalized.twitter &&
      !this.validateDomain(normalized.twitter, ['twitter.com', 'x.com'])
    ) {
      throw new Error('Invalid Twitter/X URL')
    }

    if (
      normalized.github &&
      !this.validateDomain(normalized.github, 'github.com')
    ) {
      throw new Error('Invalid GitHub URL')
    }

    return new OrganizationContact(normalized)
  }

  get email(): Email | undefined {
    return this.props.email
  }

  get phone(): number | undefined {
    return this.phone
  }

  private static validateUrl(value: string): boolean {
    try {
      const url = new URL(value)
      return ['http:', 'https:'].includes(url.protocol)
    } catch {
      return false
    }
  }

  private static validateDomain(
    value: string,
    allowedDomains: string | string[]
  ): boolean {
    try {
      const url = new URL(value)
      const domains = Array.isArray(allowedDomains)
        ? allowedDomains
        : [allowedDomains]

      return domains.some(
        (domain) =>
          url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      )
    } catch {
      return false
    }
  }

  private static validatePhone(value: string): boolean {
    // E.164 format
    return /^\+[1-9]\d{1,14}$/.test(value)
  }
}
