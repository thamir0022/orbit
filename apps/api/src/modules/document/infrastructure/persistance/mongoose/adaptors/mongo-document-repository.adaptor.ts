import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { ITransactionOptions } from '@/shared/application'

import { Document } from '../../../../domain/entities/document.entity'
import {
  FindDocumentByWorkspaceIdAndIdProps,
  FindDocumentsByWorkspaceIdAndOwnerIdProps,
  DocumentRepository,
} from '../../../../application/ports/document-repository.port'
import { DocumentId } from '../../../../domain/value-objects/document-id.vo'
import { DocumentMapper } from '../mappers/document.mapper'
import { DocumentDocument, DocumentModel } from '../schemas/document.schema'

/**
 * MongoDB implementation of the document repository port.
 *
 * Handles persistence and retrieval of document aggregates while keeping
 * MongoDB-specific concerns isolated within the infrastructure layer.
 */
@Injectable()
export class MongoDocumentRepository implements DocumentRepository {
  constructor(
    @InjectModel(DocumentModel.name)
    private readonly documentModel: Model<DocumentDocument>
  ) {}

  /**
   * Finds an active document by its identifier.
   */
  async findById(
    documentId: DocumentId,
    options?: ITransactionOptions
  ): Promise<Document | null> {
    const document = await this.documentModel
      .findOne(
        {
          id: documentId.value,
          deletedAt: null,
        },
        null,
        {
          session: options?.session,
        }
      )
      .lean()
      .exec()

    return document ? DocumentMapper.toDomainDto(document) : null
  }

  /**
   * Finds an active document by its identifier within a workspace.
   *
   * The workspace constraint ensures that document access remains
   * explicitly scoped to the current tenant boundary.
   */
  async findByWorkspaceIdAndId(
    props: FindDocumentByWorkspaceIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<Document | null> {
    const document = await this.documentModel
      .findOne(
        {
          workspaceId: props.workspaceId.value,
          id: props.documentId.value,
          deletedAt: null,
        },
        null,
        {
          session: options?.session,
        }
      )
      .lean()
      .exec()

    return document ? DocumentMapper.toDomainDto(document) : null
  }

  /**
   * Finds all active documents owned by a user within a workspace.
   *
   * Results are ordered by most recently created document first.
   */
  async findByWorkspaceIdAndOwnerId(
    props: FindDocumentsByWorkspaceIdAndOwnerIdProps,
    options?: ITransactionOptions
  ): Promise<readonly Document[]> {
    const documents = await this.documentModel
      .find(
        {
          workspaceId: props.workspaceId.value,
          ownerId: props.ownerId.value,
          deletedAt: null,
        },
        null,
        {
          session: options?.session,
        }
      )
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec()

    return documents.map((document) => DocumentMapper.toDomainDto(document))
  }

  /**
   * Persists a document aggregate.
   *
   * Replace-with-upsert keeps the repository implementation compatible
   * with both aggregate creation and subsequent updates.
   */
  async save(document: Document, options?: ITransactionOptions): Promise<void> {
    const persistenceModel = DocumentMapper.toPersistance(document)

    await this.documentModel
      .replaceOne(
        {
          id: persistenceModel.id,
        },
        persistenceModel,
        {
          upsert: true,
          runValidators: true,
          session: options?.session,
        }
      )
      .exec()
  }

  /**
   * Permanently removes a document from persistence.
   *
   * Domain-level soft deletion is handled by the document aggregate and
   * persisted through save(). This method represents repository-level
   * physical deletion when explicitly required by the application.
   */
  async delete(
    documentId: DocumentId,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.documentModel
      .deleteOne(
        {
          id: documentId.value,
          deletedAt: null,
        },
        {
          session: options?.session,
        }
      )
      .exec()
  }
}
