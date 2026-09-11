import { ValueObject } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'

interface ProjectIdProps {
  value: string
}

/**
 * ProjectId Value Object
 * Encapsulates project identifier generation and validation.
 */
export class ProjectId extends ValueObject<ProjectIdProps> {
  private constructor(props: ProjectIdProps) {
    super(props)
  }

  get value(): string {
    return this.props.value
  }

  static create(id?: string): ProjectId {
    const value = id ?? UuidUtil.generate()

    if (id && !UuidUtil.isValid(id)) {
      throw new Error('Invalid ProjectId format.')
    }

    return new ProjectId({ value })
  }

  static fromString(id: string): ProjectId {
    return ProjectId.create(id)
  }
}
