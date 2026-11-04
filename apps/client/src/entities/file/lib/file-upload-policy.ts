const MIB = 1024 * 1024

interface FileTypeRule {
  readonly mimeType: string
  readonly maxBytes: number
}

/** Mirrors the FileModule server allowlist for user feedback. */
export const FILE_TYPE_RULES: Readonly<Record<string, FileTypeRule>> = {
  '.jpg': { mimeType: 'image/jpeg', maxBytes: 10 * MIB },
  '.jpeg': { mimeType: 'image/jpeg', maxBytes: 10 * MIB },
  '.png': { mimeType: 'image/png', maxBytes: 10 * MIB },
  '.webp': { mimeType: 'image/webp', maxBytes: 10 * MIB },
  '.gif': { mimeType: 'image/gif', maxBytes: 10 * MIB },
  '.pdf': { mimeType: 'application/pdf', maxBytes: 25 * MIB },
  '.txt': { mimeType: 'text/plain', maxBytes: 10 * MIB },
  '.log': { mimeType: 'text/plain', maxBytes: 10 * MIB },
  '.mp3': { mimeType: 'audio/mpeg', maxBytes: 25 * MIB },
  '.wav': { mimeType: 'audio/wav', maxBytes: 25 * MIB },
  '.mp4': { mimeType: 'video/mp4', maxBytes: 100 * MIB },
  '.webm': { mimeType: 'video/webm', maxBytes: 100 * MIB },
}

export const MAX_ATTACHMENTS_PER_BATCH = 10

export const FILE_ACCEPT = Object.keys(FILE_TYPE_RULES).join(',')

export interface ValidatedFile {
  readonly file: File
  readonly mimeType: string
}

export type FileValidationResult =
  | { readonly success: true; readonly data: ValidatedFile }
  | { readonly success: false; readonly message: string }

/** Formats file sizes for metadata and validation messages. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const unit = bytes < MIB ? 'KiB' : 'MiB'
  const divisor = bytes < MIB ? 1024 : MIB

  return `${(bytes / divisor).toFixed(1)} ${unit}`
}

/** Validates file extension, declared MIME type, and size. */
export function validateAttachmentFile(file: File): FileValidationResult {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()

  const rule = FILE_TYPE_RULES[extension]

  if (!rule) {
    return {
      success: false,
      message: `${file.name}: Unsupported file type`,
    }
  }

  // An empty browser MIME type is allowed; the extension provides the
  // declared type. The backend independently inspects the file bytes.
  if (file.type && file.type.toLowerCase() !== rule.mimeType) {
    return {
      success: false,
      message: `${file.name}: File type does not match its extension`,
    }
  }

  if (file.size === 0) {
    return {
      success: false,
      message: `${file.name}: Empty files are not allowed`,
    }
  }

  if (!Number.isSafeInteger(file.size) || file.size > rule.maxBytes) {
    return {
      success: false,
      message: `${file.name}: Maximum size is ${formatFileSize(rule.maxBytes)}`,
    }
  }

  if (file.name.length > 255 || /[\\/\p{Cc}]/u.test(file.name)) {
    return {
      success: false,
      message: `${file.name}: Invalid filename`,
    }
  }

  return {
    success: true,
    data: {
      file,
      mimeType: rule.mimeType,
    },
  }
}
