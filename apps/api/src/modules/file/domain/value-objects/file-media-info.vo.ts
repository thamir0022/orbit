import { ValueObject } from '@/shared/domain'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'

interface FileMediaInfoProps {
  readonly width: number | null
  readonly height: number | null
  readonly durationMs: number | null
}

/** Validated intrinsic dimensions and duration extracted from verified media. */
export class FileMediaInfo extends ValueObject<FileMediaInfoProps> {
  private constructor(props: FileMediaInfoProps) {
    super(props)
  }

  static create(input: {
    width?: number | null
    height?: number | null
    durationMs?: number | null
  }): FileMediaInfo {
    const width = input.width ?? null
    const height = input.height ?? null
    const durationMs = input.durationMs ?? null

    for (const [name, value] of Object.entries({ width, height, durationMs })) {
      if (value !== null && (!Number.isSafeInteger(value) || value <= 0)) {
        throw new FileDomainException(
          FileDomainErrorCode.INVALID_SIZE,
          `${name} must be a positive safe integer`
        )
      }
    }

    if ((width === null) !== (height === null)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'Image width and height must be provided together'
      )
    }

    return new FileMediaInfo({ width, height, durationMs })
  }

  get width(): number | null {
    return this.props.width
  }
  get height(): number | null {
    return this.props.height
  }
  get durationMs(): number | null {
    return this.props.durationMs
  }
}
