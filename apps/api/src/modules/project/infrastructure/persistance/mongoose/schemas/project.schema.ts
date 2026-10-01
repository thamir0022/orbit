import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

import { ProjectPriority } from '../../../../domain/enums/project-priority.enum'
import { ProjectStage } from '../../../../domain/enums/project-stage.enum'
import { ProjectStatus } from '../../../../domain/enums/project-status.enum'
import { ProjectType } from '../../../../domain/enums/project-type.enum'

export type ProjectDocument = HydratedDocument<ProjectModel>

@Schema({
  collection: 'projects',
  timestamps: true,
  versionKey: false,
})
export class ProjectModel {
  // ---------------------------------------------------------------------------
  // Identity
  // ---------------------------------------------------------------------------

  @Prop({
    required: true,
    unique: true,
    immutable: true,
    type: MongooseSchema.Types.UUID,
  })
  id!: string

  // ---------------------------------------------------------------------------
  // Workspace
  // ---------------------------------------------------------------------------

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    index: true,
    immutable: true,
  })
  workspaceId!: string

  // ---------------------------------------------------------------------------
  // Project details
  // ---------------------------------------------------------------------------

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  name!: string

  @Prop({
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 10,
    immutable: true,
  })
  key!: string

  @Prop({
    trim: true,
    maxlength: 1000,
  })
  description?: string

  @Prop({
    trim: true,
  })
  avatarUrl?: string

  // ---------------------------------------------------------------------------
  // Project classification
  // ---------------------------------------------------------------------------

  @Prop({
    required: true,
    enum: Object.values(ProjectType),
    default: ProjectType.PRODUCT,
    index: true,
  })
  type!: ProjectType

  @Prop({
    required: true,
    enum: Object.values(ProjectStage),
    default: ProjectStage.PROPOSAL,
    index: true,
  })
  stage!: ProjectStage

  @Prop({
    required: true,
    enum: Object.values(ProjectPriority),
    default: ProjectPriority.NO_PRIORITY,
    index: true,
  })
  priority!: ProjectPriority

  // ---------------------------------------------------------------------------
  // Project ownership
  // ---------------------------------------------------------------------------

  @Prop({
    type: MongooseSchema.Types.UUID,
    index: true,
  })
  leadId?: string

  // ---------------------------------------------------------------------------
  // Project lifecycle
  // ---------------------------------------------------------------------------

  @Prop({
    required: true,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.ACTIVE,
    index: true,
  })
  status!: ProjectStatus

  @Prop()
  startDate?: Date

  @Prop()
  targetEndDate?: Date

  // ---------------------------------------------------------------------------
  // Audit
  // ---------------------------------------------------------------------------

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
  })
  createdBy!: string

  // timestamps managed by Mongoose
  createdAt!: Date
  updatedAt!: Date

  // ---------------------------------------------------------------------------
  // Soft deletion
  // ---------------------------------------------------------------------------

  @Prop({
    type: Date,
    default: null,
    index: true,
  })
  deletedAt!: Date | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
  })
  deletedBy!: string | null
}

export const ProjectSchema = SchemaFactory.createForClass(ProjectModel)

// -----------------------------------------------------------------------------
// Compound indexes
// -----------------------------------------------------------------------------

/**
 * Ensures project keys are unique among active projects
 * within the same workspace.
 *
 * Including deletedAt allows a new project to reuse the key
 * after the previous project has been soft deleted.
 */
ProjectSchema.index(
  {
    workspaceId: 1,
    key: 1,
    deletedAt: 1,
  },
  {
    unique: true,
    name: 'workspace_project_key_unique',
  }
)

/**
 * Optimized for listing active projects in a workspace
 * ordered by newest first.
 */
ProjectSchema.index(
  {
    workspaceId: 1,
    deletedAt: 1,
    createdAt: -1,
  },
  {
    name: 'workspace_deleted_created_at_idx',
  }
)

/**
 * Optimized for filtering workspace projects by status.
 */
ProjectSchema.index(
  {
    workspaceId: 1,
    deletedAt: 1,
    status: 1,
  },
  {
    name: 'workspace_deleted_status_idx',
  }
)

/**
 * Optimized for filtering workspace projects by lead.
 */
ProjectSchema.index(
  {
    workspaceId: 1,
    deletedAt: 1,
    leadId: 1,
  },
  {
    name: 'workspace_deleted_lead_idx',
  }
)

/**
 * Optimized for workspace-level filtering by classification.
 */
ProjectSchema.index(
  {
    workspaceId: 1,
    deletedAt: 1,
    priority: 1,
    type: 1,
  },
  {
    name: 'workspace_deleted_priority_type_idx',
  }
)
