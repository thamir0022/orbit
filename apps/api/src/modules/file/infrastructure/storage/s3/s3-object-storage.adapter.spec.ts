import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { StorageObjectRef } from '@/modules/file/domain'
import type { IFileConfig } from '@/modules/file/application/ports/file-config.port'
import { S3ObjectStorageAdapter } from './s3-object-storage.adapter'

describe('S3 file disposal', () => {
  afterEach(() => jest.restoreAllMocks())

  it.each([
    ['v1', 'v1'],
    [null, 'null'],
  ])(
    'permanently deletes the stored revision %s without creating a delete marker',
    async (versionId, expectedVersionId) => {
      const send = jest
        .spyOn(S3Client.prototype, 'send')
        .mockImplementation(() => undefined)
      const adapter = new S3ObjectStorageAdapter({
        s3Region: 'us-east-1',
        s3Bucket: 'test-bucket',
        storageLocationId: 'primary',
        s3ForcePathStyle: false,
      } as IFileConfig)
      try {
        await adapter.delete(
          StorageObjectRef.create({
            locationId: 'primary',
            key: 'files/test',
            versionId,
          }),
          { permanent: true }
        )
        expect(send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
        expect(send).toHaveBeenCalledWith(
          expect.objectContaining({
            input: {
              Bucket: 'test-bucket',
              Key: 'files/test',
              VersionId: expectedVersionId,
            },
          })
        )
      } finally {
        adapter.onModuleDestroy()
      }
    }
  )
})
