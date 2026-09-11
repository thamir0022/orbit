import { ValueObject } from '@/shared/domain'

interface ProjectKeyProps {
  value: string
}

/**
 * ProjectKey Value Object
 *
 * Examples:
 * ORB
 * CRM
 * API
 * MOBILE
 */
export class ProjectKey extends ValueObject<ProjectKeyProps> {
  private static readonly REGEX = /^[A-Z][A-Z0-9]{1,9}$/

  private constructor(props: ProjectKeyProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(key: string): ProjectKey {
    const value = key.trim().toUpperCase()

    if (!this.REGEX.test(value)) {
      throw new Error(
        'Project key must contain 2-10 uppercase letters or numbers and start with a letter.'
      )
    }

    return new ProjectKey({ value })
  }
}
