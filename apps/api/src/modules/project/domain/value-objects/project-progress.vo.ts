import { ValueObject } from '@/shared/domain'

interface ProjectProgressProps {
  value: number
}

/**
 * ProjectProgress Value Object
 * Represents the completion percentage of a project (0-100).
 */
export class ProjectProgress extends ValueObject<ProjectProgressProps> {
  private static readonly MIN = 0
  private static readonly MAX = 100

  private constructor(props: ProjectProgressProps) {
    super(props)
  }

  get value(): number {
    return this.props.value
  }

  get isCompleted(): boolean {
    return this.value === 100
  }

  get isNotStarted(): boolean {
    return this.value === 0
  }

  static create(progress = 0): ProjectProgress {
    if (!Number.isInteger(progress)) {
      throw new Error('Project progress must be an integer.')
    }

    if (progress < this.MIN || progress > this.MAX) {
      throw new Error(
        `Project progress must be between ${this.MIN} and ${this.MAX}.`
      )
    }

    return new ProjectProgress({
      value: progress,
    })
  }

  static zero(): ProjectProgress {
    return this.create(0)
  }

  static complete(): ProjectProgress {
    return this.create(100)
  }
}
