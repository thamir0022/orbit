import { createConnection } from 'node:net'
import type { Socket } from 'node:net'
import { Inject, Injectable } from '@nestjs/common'
import { StorageObjectRef } from '@/modules/file/domain'
import type {
  FileSecurityScannerPort,
  FileSecurityScanResult,
} from '@/modules/file/application/ports/file-security-scanner.port'
import type { ObjectStoragePort } from '@/modules/file/application/ports/object-storage.port'
import { OBJECT_STORAGE } from '@/modules/file/application/ports/object-storage.port'

/** Fail-closed ClamAV INSTREAM transport with bounded input and scanner timeouts. */
@Injectable()
export class ClamAvFileSecurityScanner implements FileSecurityScannerPort {
  constructor(
    @Inject(OBJECT_STORAGE) private readonly storage: ObjectStoragePort,
    private readonly host: string,
    private readonly port: number,
    private readonly maxBytes: number,
    private readonly timeoutMs: number
  ) {
    if (
      !host ||
      !Number.isSafeInteger(port) ||
      port < 1 ||
      port > 65535 ||
      !Number.isSafeInteger(maxBytes) ||
      maxBytes < 1 ||
      !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1000
    ) {
      throw new Error('Invalid ClamAV scanner configuration')
    }
  }

  async scan(
    object: StorageObjectRef,
    expectedEtag: string
  ): Promise<FileSecurityScanResult> {
    const socket = createConnection({ host: this.host, port: this.port })
    socket.setTimeout(this.timeoutMs, () =>
      socket.destroy(new Error('ClamAV scan timed out'))
    )
    const response = new Promise<string>((resolve, reject) => {
      let output = ''
      socket.on('data', (data: Buffer) => {
        output += data.toString('utf8')
        if (output.length > 4096)
          socket.destroy(new Error('Unexpected scanner response length'))
        if (output.includes('\0')) resolve(output.split('\0')[0])
      })
      socket.once('error', reject)
      socket.once('close', () => {
        if (!output.includes('\0'))
          reject(new Error('Scanner closed connection before replying'))
      })
    })
    // Install a rejection handler before streaming, including when connection setup fails.
    void response.catch(() => undefined)
    try {
      await new Promise<void>((resolve, reject) => {
        socket.once('connect', resolve)
        socket.once('error', reject)
      })
      await this.write(socket, Buffer.from('zINSTREAM\0'))
      let sent = 0
      for await (const chunk of await this.storage.read(object, expectedEtag)) {
        sent += chunk.byteLength
        if (sent > this.maxBytes)
          throw new Error('File exceeds ClamAV stream limit')
        const length = Buffer.allocUnsafe(4)
        length.writeUInt32BE(chunk.byteLength, 0)
        await this.write(socket, length)
        await this.write(socket, chunk)
      }
      await this.write(socket, Buffer.alloc(4))
      const result = await response
      if (result.endsWith(' OK')) return { clean: true, reason: null }
      if (result.endsWith(' FOUND'))
        return { clean: false, reason: 'Malware signature detected' }
      throw new Error('ClamAV failed to scan file')
    } finally {
      socket.destroy()
    }
  }

  private write(socket: Socket, buffer: Uint8Array): Promise<void> {
    return new Promise((resolve, reject) => {
      socket.write(buffer, (error?: Error | null) =>
        error ? reject(error) : resolve()
      )
    })
  }
}
