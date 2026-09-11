import {
  ProjectPriority,
  ProjectStatus,
  ProjectType,
} from '@/modules/project/domain/enums'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'

export type ProjectDocument = HydratedDocument<ProjectModel>

@Schema({
  collection: 'projects',
  timestamps: true,
})
export class ProjectModel {
  @Prop({
    required: true,
    unique: true,
    type: MongooseSchema.Types.UUID,
    index: true,
  })
  id!: string // UUID v7

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
    index: true,
  })
  workspaceId!: string

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
  })
  key!: string

  @Prop({
    maxlength: 1000,
  })
  description?: string

  @Prop({
    type: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    default: [],
  })
  resources!: {
    name: string
    url: string
  }[]

  @Prop()
  avatarUrl?: string

  // Project Details

  @Prop()
  startDate?: Date

  @Prop()
  targetEndDate?: Date

  @Prop({
    enum: Object.values(ProjectType),
    index: true,
  })
  type?: ProjectType

  @Prop({
    required: true,
    enum: Object.values(ProjectPriority),
    default: ProjectPriority.MEDIUM,
    index: true,
  })
  priority!: ProjectPriority

  // Lead

  @Prop({
    type: MongooseSchema.Types.UUID,
    index: true,
  })
  leadId?: string

  // Status

  @Prop({
    required: true,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.ACTIVE,
    index: true,
  })
  status!: ProjectStatus

  @Prop({
    required: true,
    default: 0,
    min: 0,
    max: 100,
  })
  progress!: number

  @Prop({
    required: true,
    type: MongooseSchema.Types.UUID,
  })
  createdBy!: string

  // timestamps managed by mongoose

  createdAt!: Date
  updatedAt!: Date
}

export const ProjectSchema = SchemaFactory.createForClass(ProjectModel)

/**
 * Compound Indexes
 */

// Workspace + Project Id
ProjectSchema.index(
  { workspaceId: 1, id: 1 },
  {
    unique: true,
    name: 'workspace_project_id_idx',
  }
)

// Workspace + Project Key
ProjectSchema.index(
  { workspaceId: 1, key: 1 },
  {
    unique: true,
    name: 'workspace_project_key_idx',
  }
)

// List projects in a workspace
ProjectSchema.index(
  { workspaceId: 1, status: 1 },
  {
    name: 'workspace_status_idx',
  }
)

// Workspace project listing
ProjectSchema.index(
  { workspaceId: 1, createdAt: -1 },
  {
    name: 'workspace_created_at_idx',
  }
)

// Projects by lead
ProjectSchema.index(
  { workspaceId: 1, leadId: 1 },
  {
    name: 'workspace_lead_idx',
  }
)

// Filtering
ProjectSchema.index(
  {
    workspaceId: 1,
    priority: 1,
    type: 1,
  },
  {
    name: 'workspace_priority_type_idx',
  }
)
