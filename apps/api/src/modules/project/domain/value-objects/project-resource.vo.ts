import { ValueObject } from '@/shared/domain'

interface ProjectResourceProps {
  name: string
  url: string
}

/**
 * ProjectResource Value Object
 */
export class ProjectResource extends ValueObject<ProjectResourceProps> {
  private static readonly MAX_NAME_LENGTH = 100

  private constructor(props: ProjectResourceProps) {
    super(props)
  }

  get name(): string {
    return this.props.name
  }

  get url(): string {
    return this.props.url
  }

  static create(props: ProjectResourceProps): ProjectResource {
    const name = props.name.trim()
    const url = props.url.trim()

    if (!name) {
      throw new Error('Resource name is required.')
    }

    if (name.length > this.MAX_NAME_LENGTH) {
      throw new Error('Resource name is too long.')
    }

    try {
      new URL(url)
    } catch {
      throw new Error('Invalid resource URL.')
    }

    return new ProjectResource({
      name,
      url,
    })
  }
}
