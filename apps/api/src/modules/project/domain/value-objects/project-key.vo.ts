import { ValueObject } from '@/shared/domain'

import { ProjectKeyInvalidException } from '../exceptions/project-key-invalid.exception'

interface ProjectKeyProps {
  readonly value: string
}

export class ProjectKey extends ValueObject<ProjectKeyProps> {
  private static readonly PREFIX_LENGTH = 3
  private static readonly NUMBER_WIDTH = 3

  private static readonly PATTERN = /^[A-Z0-9]{3}-\d+$/

  private constructor(props: ProjectKeyProps) {
    super(props)
  }

  /**
   * Creates a ProjectKey from an already generated value.
   *
   * Example:
   * ORB-001
   */
  static create(value: string): ProjectKey {
    const normalizedValue = value.trim().toUpperCase()

    if (!ProjectKey.PATTERN.test(normalizedValue)) {
      throw new ProjectKeyInvalidException()
    }

    return new ProjectKey({
      value: normalizedValue,
    })
  }

  /**
   * Generates a project key from the project name and
   * workspace-scoped sequential project number.
   *
   * Example:
   * Orbit + 1 → ORB-001
   */
  static generate(projectName: string, number: number): ProjectKey {
    if (!Number.isInteger(number) || number <= 0) {
      throw new ProjectKeyInvalidException()
    }

    const prefix = ProjectKey.createPrefix(projectName)

    const value = `${prefix}-${number
      .toString()
      .padStart(ProjectKey.NUMBER_WIDTH, '0')}`

    return ProjectKey.create(value)
  }

  static fromString(value: string): ProjectKey {
    return ProjectKey.create(value)
  }

  get value(): string {
    return this.props.value
  }

  private static createPrefix(projectName: string): string {
    const normalizedName = projectName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')

    const prefix = normalizedName.slice(0, ProjectKey.PREFIX_LENGTH)

    if (prefix.length !== ProjectKey.PREFIX_LENGTH) {
      throw new ProjectKeyInvalidException()
    }

    return prefix
  }
}
