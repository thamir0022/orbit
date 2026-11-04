import { randomBytes } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { FileId, FileScope, StorageObjectRef } from '@/modules/file/domain'
import { StorageObjectKeyFactoryPort } from '@/modules/file/application/ports/storage-object-key-factory.port'

/** Isolates staging writes and gives retries a stable, unguessable final object key. */
@Injectable()
export class StorageObjectKeyFactory implements StorageObjectKeyFactoryPort {
  constructor(private readonly writeLocationId: string) {}

  staging(scope: FileScope, fileId: FileId): StorageObjectRef {
    return this.ref(
      `staging/${scope.type}/${scope.id}/${fileId.value}/${randomBytes(24).toString('hex')}`
    )
  }

  permanent(scope: FileScope, fileId: FileId): StorageObjectRef {
    return this.ref(`objects/${scope.type}/${scope.id}/${fileId.value}`)
  }

  private ref(key: string): StorageObjectRef {
    return StorageObjectRef.create({ locationId: this.writeLocationId, key })
  }
}
