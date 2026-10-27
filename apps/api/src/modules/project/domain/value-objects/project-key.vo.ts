import { ValueObject } from '@/shared/domain'

import { ProjectKeyInvalidException } from '../exceptions/project-key-invalid.exception'

interface ProjectKeyProps {
  readonly value: string
}

export class ProjectKey extends ValueObject<ProjectKeyProps> {
  private static readonly MAX_LENGTH = 10

  private static readonly PATTERN = /^[A-Z][A-Z0-9]{1,9}$/

  private constructor(props: ProjectKeyProps) {
    super(props)
  }

  /** Creates a project key from an existing value, e.g. ORB. */
  static create(value: string): ProjectKey {
    const normalizedValue = value.trim().toUpperCase()

    if (!ProjectKey.PATTERN.test(normalizedValue)) {
      throw new ProjectKeyInvalidException()
    }

    return new ProjectKey({ value: normalizedValue })
  }

  /**
   * Generates a readable project key candidate from a project name.
   * Uniqueness is enforced by the application and persistence layer.
   */
  static generate(projectName: string): ProjectKey {
    const normalizedName = projectName
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()

    const words = normalizedName.match(/[A-Z0-9]+/g) ?? []

    if (words.length === 0) {
      throw new ProjectKeyInvalidException()
    }

    let candidate =
      words.length === 1
        ? words[0].slice(0, 3)
        : words
            .map((word) => word[0])
            .join('')
            .slice(0, 5)

    if (candidate.length < 2) {
      const compactName = words.join('')

      candidate =
        compactName.length >= 2 ? compactName.slice(0, 2) : `${candidate}P`
    }

    if (!/^[A-Z]/.test(candidate)) {
      candidate = `P${candidate}`
    }

    return ProjectKey.create(candidate.slice(0, ProjectKey.MAX_LENGTH))
  }

  /** Restores a project key from its persisted value. */
  static fromString(value: string): ProjectKey {
    return ProjectKey.create(value)
  }

  get value(): string {
    return this.props.value
  }
}
