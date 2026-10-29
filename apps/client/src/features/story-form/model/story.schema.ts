import { z } from 'zod'
export const schema = z.object({
  title: z.string().trim().min(1, 'Enter a title').max(250),
  description: z.string().max(5000),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']),
  storyPoints: z
    .string()
    .refine(
      (value) =>
        value === '' ||
        (Number.isInteger(Number(value)) &&
          Number(value) >= 1 &&
          Number(value) <= 1000),
      'Enter a whole number between 1 and 1000'
    ),
  status: z.enum([
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'done',
    'cancelled',
  ]),
})
export type Values = z.infer<typeof schema>
