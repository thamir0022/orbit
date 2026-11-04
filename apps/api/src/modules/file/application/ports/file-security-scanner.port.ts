import { StorageObjectRef } from '@/modules/file/domain'

/** Trusted scanner result, never derived from user-declared content type. */
export interface FileSecurityScanResult {
  readonly clean: boolean
  readonly reason: string | null
}

/** Fail-closed malware scanning contract; production must bind a real implementation. */
export interface FileSecurityScannerPort {
  scan(
    object: StorageObjectRef,
    expectedEtag: string
  ): Promise<FileSecurityScanResult>
}

export const FILE_SECURITY_SCANNER = Symbol('IFileSecurityScanner')
