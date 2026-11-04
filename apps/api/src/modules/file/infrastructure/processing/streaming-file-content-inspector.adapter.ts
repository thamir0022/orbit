import { createHash } from 'node:crypto'
import { Inject, Injectable } from '@nestjs/common'
import { FileMediaType, type StorageObjectRef } from '@/modules/file/domain'
import {
  FileContentRejectedError,
  type FileContentInspectorPort,
  type VerifiedFileContent,
} from '@/modules/file/application/ports/file-content-inspector.port'
import {
  OBJECT_STORAGE,
  type ObjectStoragePort,
} from '@/modules/file/application/ports/object-storage.port'

const SNIFF_BYTES = 8192

function startsWith(bytes: Buffer, prefix: readonly number[]): boolean {
  return (
    bytes.length >= prefix.length &&
    prefix.every((item, index) => bytes[index] === item)
  )
}

/** Detects supported file formats using their signatures. */
function detectMime(bytes: Buffer): string | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png'
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg'
  }

  const gifHeader = bytes.subarray(0, 6).toString('ascii')

  if (gifHeader === 'GIF87a' || gifHeader === 'GIF89a') {
    return 'image/gif'
  }

  if (
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp'
  }

  if (bytes.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf'
  }

  if (
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WAVE'
  ) {
    return 'audio/wav'
  }

  if (bytes.subarray(4, 8).toString('ascii') === 'ftyp') {
    return 'video/mp4'
  }

  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) {
    return 'video/webm'
  }

  if (
    bytes.subarray(0, 3).toString('ascii') === 'ID3' ||
    (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe6) === 0xe2)
  ) {
    return 'audio/mpeg'
  }

  return null
}

/** Rejects control characters except tab, LF, and CR. */
function hasForbiddenTextControl(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)

    if (
      (code < 32 && code !== 9 && code !== 10 && code !== 13) ||
      code === 127
    ) {
      return true
    }
  }

  return false
}

const CATEGORIES: Readonly<Record<string, FileMediaType>> = {
  'image/jpeg': FileMediaType.IMAGE,
  'image/png': FileMediaType.IMAGE,
  'image/webp': FileMediaType.IMAGE,
  'image/gif': FileMediaType.IMAGE,
  'application/pdf': FileMediaType.DOCUMENT,
  'text/plain': FileMediaType.DOCUMENT,
  'video/mp4': FileMediaType.VIDEO,
  'video/webm': FileMediaType.VIDEO,
  'audio/mpeg': FileMediaType.AUDIO,
  'audio/wav': FileMediaType.AUDIO,
}

/** Streams and validates file content without buffering the entire object. */
@Injectable()
export class StreamingFileContentInspector implements FileContentInspectorPort {
  constructor(
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStoragePort
  ) {}

  async inspect(input: {
    object: StorageObjectRef
    expectedEtag: string
    expectedBytes: number
    declaredMimeType: string
  }): Promise<VerifiedFileContent> {
    const hash = createHash('sha256')
    const textDecoder = new TextDecoder('utf-8', {
      fatal: true,
    })

    let count = 0
    let prefix = Buffer.alloc(0)

    const isText = input.declaredMimeType === 'text/plain'

    try {
      const stream = await this.storage.read(input.object, input.expectedEtag)

      for await (const chunk of stream) {
        count += chunk.byteLength

        if (count > input.expectedBytes) {
          throw new FileContentRejectedError(
            'Uploaded bytes exceeded the permitted size'
          )
        }

        hash.update(chunk)

        if (prefix.length < SNIFF_BYTES) {
          prefix = Buffer.concat([
            prefix,
            Buffer.from(chunk.subarray(0, SNIFF_BYTES - prefix.length)),
          ])
        }

        if (isText) {
          const decoded = textDecoder.decode(chunk, {
            stream: true,
          })

          if (hasForbiddenTextControl(decoded)) {
            throw new FileContentRejectedError(
              'Text contains forbidden control characters'
            )
          }
        }
      }

      if (isText) {
        textDecoder.decode()
      }
    } catch (error: unknown) {
      if (error instanceof TypeError && isText) {
        throw new FileContentRejectedError('Text is not valid UTF-8')
      }

      throw error
    }

    if (count !== input.expectedBytes) {
      throw new FileContentRejectedError(
        'Uploaded file size differs from its upload reservation'
      )
    }

    const detected = detectMime(prefix)

    if (isText) {
      const start = prefix
        .toString('utf8')
        .replace(/^\ufeff/, '')
        .trimStart()
        .toLowerCase()

      if (
        detected !== null ||
        /^(?:<\?xml|<!doctype|<html|<svg|<script)/.test(start)
      ) {
        throw new FileContentRejectedError('Text content is not permitted')
      }
    } else if (detected !== input.declaredMimeType) {
      throw new FileContentRejectedError(
        'File signature does not match the declared MIME type'
      )
    }

    const mime = isText ? 'text/plain' : detected

    if (!mime || !CATEGORIES[mime]) {
      throw new FileContentRejectedError('Unsupported file signature')
    }

    return {
      sizeBytes: count,
      sha256: hash.digest('hex'),
      mimeType: mime,
      mediaType: CATEGORIES[mime],
    }
  }
}
