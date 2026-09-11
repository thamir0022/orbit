import {
  ProjectPriority,
  ProjectStatus,
  ProjectType,
} from '@/modules/project/domain/enums'

export interface GetProjectsInput {
  readonly workspaceId: string

  readonly name?: string

  readonly key?: string

  readonly type?: ProjectType

  readonly priority?: ProjectPriority

  readonly status?: ProjectStatus
}
