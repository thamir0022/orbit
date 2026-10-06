import * as z from 'zod'

import {
  ProjectPriority,
  ProjectStage,
  ProjectStatus,
  ProjectType,
} from '@/entities/project/model/project.types'

const projectTypeValues = Object.values(ProjectType) as [
  ProjectType,
  ...ProjectType[],
]

const projectStageValues = Object.values(ProjectStage) as [
  ProjectStage,
  ...ProjectStage[],
]

const projectPriorityValues = Object.values(ProjectPriority) as [
  ProjectPriority,
  ...ProjectPriority[],
]

const projectStatusValues = Object.values(ProjectStatus) as [
  ProjectStatus,
  ...ProjectStatus[],
]

const dateTimeLocal = z
  .string()
  .refine((value) => value === '' || !Number.isNaN(new Date(value).getTime()), {
    message: 'Enter a valid date.',
  })

export const UpdateProjectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name is required.'),

    description: z.string(),

    avatarUrl: z.url().or(z.literal('')),

    type: z.enum(projectTypeValues),

    stage: z.enum(projectStageValues),

    priority: z.enum(projectPriorityValues),

    status: z.enum(projectStatusValues),

    leadId: z.string().nullable(),

    startDate: dateTimeLocal,

    targetEndDate: dateTimeLocal,
  })
  .superRefine((values, context) => {
    if (!values.startDate || !values.targetEndDate) {
      return
    }

    const start = new Date(values.startDate).getTime()

    const target = new Date(values.targetEndDate).getTime()

    if (target < start) {
      context.addIssue({
        code: 'custom',
        path: ['targetEndDate'],
        message: 'Target date cannot be before the start date.',
      })
    }
  })

export type UpdateProjectFormValues = z.infer<typeof UpdateProjectSchema>
