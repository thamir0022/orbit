import { z } from 'zod'

import {
  ProjectPriority,
  ProjectStage,
  ProjectType,
} from '@/entities/project/model/project.types'

const optionalDate = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) {
        return true
      }

      return !Number.isNaN(new Date(`${value}T00:00:00`).getTime())
    },
    {
      message: 'Invalid date',
    }
  )

export const CreateProjectSchema = z
  .object({
    name: z.string().trim().min(3, 'Project name should have mininum 3 letters').max(50, 'Project name is too long'),

    description: z.string().trim().optional(),

    type: z.enum(ProjectType).optional(),

    stage: z.enum(ProjectStage).optional(),

    priority: z.enum(ProjectPriority).optional(),

    startDate: optionalDate,

    targetEndDate: optionalDate,
  })
  .refine(
    (values) => {
      if (!values.startDate || !values.targetEndDate) {
        return true
      }

      return (
        new Date(`${values.targetEndDate}T00:00:00`).getTime() >=
        new Date(`${values.startDate}T00:00:00`).getTime()
      )
    },
    {
      path: ['targetEndDate'],
      message: 'Target date must be on or after the start date',
    }
  )

export type CreateProjectFormValues = z.infer<typeof CreateProjectSchema>
