import { ValueObject } from '@/shared/domain'

interface ProjectNameProps {
  value: string
}

/**
 * ProjectName Value Object
 */
export class ProjectName extends ValueObject<ProjectNameProps> {
  private static readonly MIN_LENGTH = 3
  private static readonly MAX_LENGTH = 100

  private constructor(props: ProjectNameProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(name: string): ProjectName {
    const value = name.trim()

    if (!value) {
      throw new Error('Project name is required.')
    }

    if (value.length < this.MIN_LENGTH) {
      throw new Error(
        `Project name must be at least ${this.MIN_LENGTH} characters.`
      )
    }

    if (value.length > this.MAX_LENGTH) {
      throw new Error(
        `Project name cannot exceed ${this.MAX_LENGTH} characters.`
      )
    }

    return new ProjectName({ value })
  }
}
