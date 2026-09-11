import { ValueObject } from '@/shared/domain'

interface ProjectAvatarProps {
  value: string | undefined
}

/**
 * ProjectAvatar Value Object
 */
export class ProjectAvatar extends ValueObject<ProjectAvatarProps> {
  private static readonly MAX_LENGTH = 2048

  private constructor(props: ProjectAvatarProps) {
    super(props)
  }

  get value(): string | undefined {
    return this.props.value
  }

  static create(url?: string): ProjectAvatar {
    const value = url?.trim()

    if (!value) {
      return new ProjectAvatar({
        value: undefined,
      })
    }

    if (value.length > this.MAX_LENGTH) {
      throw new Error('Avatar URL is too long.')
    }

    try {
      new URL(value)
    } catch {
      throw new Error('Invalid avatar URL.')
    }

    return new ProjectAvatar({
      value,
    })
  }
}
