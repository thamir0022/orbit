import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import {
  FILE_CONFIG,
  type IFileConfig,
} from '@/modules/file/application/ports/file-config.port'
import { createFileConfig } from './config/file.config'
import { FILE_REPOSITORY } from '../application/ports/repositories/file-repository.port'
import { ATTACHMENT_REPOSITORY } from '../application/ports/repositories/attachment-repository.port'
import { UPLOAD_SESSION_REPOSITORY } from '../application/ports/repositories/upload-session-repository.port'
import { STORAGE_USAGE_REPOSITORY } from '../application/ports/repositories/storage-usage-repository.port'
import { FILE_UNIT_OF_WORK } from '../application/ports/repositories/file-unit-of-work.port'
import { OBJECT_STORAGE } from '../application/ports/object-storage.port'
import { STORAGE_OBJECT_KEY_FACTORY } from '../application/ports/storage-object-key-factory.port'
import { MongoFileRepository } from './persistence/mongoose/repositories/mongo-file.repository'
import { MongoAttachmentRepository } from './persistence/mongoose/repositories/mongo-attachment.repository'
import { MongoUploadSessionRepository } from './persistence/mongoose/repositories/mongo-upload-session.repository'
import { MongoStorageUsageRepository } from './persistence/mongoose/repositories/mongo-storage-usage.repository'
import { MongoFileUnitOfWork } from './persistence/mongoose/mongo-file-unit-of-work'
import {
  FileMongoModel,
  FileSchema,
} from './persistence/mongoose/schemas/file.schema'
import {
  AttachmentMongoModel,
  AttachmentSchema,
} from './persistence/mongoose/schemas/attachment.schema'
import {
  UploadSessionMongoModel,
  UploadSessionSchema,
} from './persistence/mongoose/schemas/upload-session.schema'
import {
  StorageUsageMongoModel,
  StorageUsageSchema,
} from './persistence/mongoose/schemas/storage-usage.schema'
import { S3ObjectStorageAdapter } from './storage/s3/s3-object-storage.adapter'
import { StorageObjectKeyFactory } from './storage/storage-object-key.factory'
import { FileProcessingRecoveryQuery } from './processing/file-processing-recovery.query'

/** Infrastructure bindings; controllers and use cases depend on ports, never on adapters. */
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: FileMongoModel.name, schema: FileSchema },
      { name: AttachmentMongoModel.name, schema: AttachmentSchema },
      { name: UploadSessionMongoModel.name, schema: UploadSessionSchema },
      { name: StorageUsageMongoModel.name, schema: StorageUsageSchema },
    ]),
  ],
  providers: [
    {
      provide: FILE_CONFIG,
      useFactory: createFileConfig,
      inject: [ConfigService],
    },
    MongoFileRepository,
    MongoAttachmentRepository,
    MongoUploadSessionRepository,
    MongoStorageUsageRepository,
    MongoFileUnitOfWork,
    FileProcessingRecoveryQuery,
    { provide: FILE_REPOSITORY, useExisting: MongoFileRepository },
    { provide: ATTACHMENT_REPOSITORY, useExisting: MongoAttachmentRepository },
    {
      provide: UPLOAD_SESSION_REPOSITORY,
      useExisting: MongoUploadSessionRepository,
    },
    {
      provide: STORAGE_USAGE_REPOSITORY,
      useExisting: MongoStorageUsageRepository,
    },
    { provide: FILE_UNIT_OF_WORK, useExisting: MongoFileUnitOfWork },
    { provide: OBJECT_STORAGE, useClass: S3ObjectStorageAdapter },
    {
      provide: STORAGE_OBJECT_KEY_FACTORY,
      useFactory: (config: IFileConfig) =>
        new StorageObjectKeyFactory(config.storageLocationId),
      inject: [FILE_CONFIG],
    },
  ],
  exports: [
    FILE_CONFIG,
    FILE_REPOSITORY,
    ATTACHMENT_REPOSITORY,
    UPLOAD_SESSION_REPOSITORY,
    STORAGE_USAGE_REPOSITORY,
    FILE_UNIT_OF_WORK,
    OBJECT_STORAGE,
    STORAGE_OBJECT_KEY_FACTORY,
    FileProcessingRecoveryQuery,
  ],
})
export class FileInfrastructureModule {}
