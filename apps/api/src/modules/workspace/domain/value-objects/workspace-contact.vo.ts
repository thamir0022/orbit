import { Email } from '@/modules/user/domain'
import { ValueObject } from '@/shared/domain'

export interface WorkspaceContactProps {
  phone?: string
  email?: Email
  website?: string
  linkedin?: string
  twitter?: string
  github?: string
}

export interface RawWorkspaceContactProps {
  phone?: string
  email?: string
  website?: string
  linkedin?: string
  twitter?: string
  github?: string
}

export class WorkspaceContact extends ValueObject<WorkspaceContactProps> {
  private constructor(props: WorkspaceContactProps) {
    super(props)
  }

  static empty(): WorkspaceContact {
    return new WorkspaceContact({})
  }

  static create(props: Partial<WorkspaceContactProps> = {}): WorkspaceContact {
    const normalized: WorkspaceContactProps = {
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

    return new WorkspaceContact(normalized)
  }

  static fromPersistence(
    raw?: RawWorkspaceContactProps | null
  ): WorkspaceContact {
    if (!raw) return WorkspaceContact.empty()

    let email: Email | undefined

    if (raw.email) {
      const emailResult = Email.create(raw.email.trim())
      if (emailResult.isSuccess) {
        email = emailResult.value
      }
    }

    return WorkspaceContact.create({
      email,
      phone: raw.phone,
      website: raw.website,
      linkedin: raw.linkedin,
      twitter: raw.twitter,
      github: raw.github,
    })
  }

  get email(): Email | undefined {
    return this.props.email
  }

  get phone(): string | undefined {
    return this.props.phone
  }

  toPersistence(): RawWorkspaceContactProps {
    return {
      phone: this.props.phone,
      email: this.props.email?.value,
      website: this.props.website,
      linkedin: this.props.linkedin,
      twitter: this.props.twitter,
      github: this.props.github,
    }
  }

  toPrimitives(): RawWorkspaceContactProps {
    return this.toPersistence()
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
    return /^\+[1-9]\d{1,14}$/.test(value)
  }
}
