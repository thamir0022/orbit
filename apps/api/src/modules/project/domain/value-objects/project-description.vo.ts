import { ValueObject } from '@/shared/domain'

interface ProjectDescriptionProps {
  value: string | undefined
}

/**
 * ProjectDescription Value Object
 */
export class ProjectDescription extends ValueObject<ProjectDescriptionProps> {
  private static readonly MAX_LENGTH = 1000

  private constructor(props: ProjectDescriptionProps) {
    super(props)
  }

  get value(): string | undefined {
    return this.props.value
  }

  static create(description?: string): ProjectDescription {
    const value = description?.trim()

    if (value && value.length > this.MAX_LENGTH) {
      throw new Error(
        `Project description cannot exceed ${this.MAX_LENGTH} characters.`
      )
    }

    return new ProjectDescription({
      value: value || undefined,
    })
  }
}
