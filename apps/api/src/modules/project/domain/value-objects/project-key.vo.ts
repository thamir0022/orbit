import { randomBytes } from 'node:crypto'

import { ValueObject } from '@/shared/domain'

import { ProjectKeyInvalidException } from '../exceptions/project-key-invalid.exception'

interface ProjectKeyProps {
  readonly value: string
}

export class ProjectKey extends ValueObject<ProjectKeyProps> {
  private static readonly PREFIX_LENGTH = 3
  private static readonly RANDOM_SUFFIX_BYTES = 4
  private static readonly PATTERN = /^[A-Z0-9]{3}-[A-F0-9]{8}$/

  private constructor(props: ProjectKeyProps) {
    super(props)
  }

  /** Creates a project key from an existing value. */
  static create(value: string): ProjectKey {
    const normalizedValue = value.trim().toUpperCase()

    if (!ProjectKey.PATTERN.test(normalizedValue)) {
      throw new ProjectKeyInvalidException()
    }

    return new ProjectKey({ value: normalizedValue })
  }

  /** Generates a project key, e.g. ORB-A1B2C3D4. */
  static generate(projectName: string): ProjectKey {
    const prefix = projectName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, ProjectKey.PREFIX_LENGTH)

    if (prefix.length !== ProjectKey.PREFIX_LENGTH) {
      throw new ProjectKeyInvalidException()
    }

    const suffix = randomBytes(ProjectKey.RANDOM_SUFFIX_BYTES)
      .toString('hex')
      .toUpperCase()

    return ProjectKey.create(`${prefix}-${suffix}`)
  }

  get value(): string {
    return this.props.value
  }
}
