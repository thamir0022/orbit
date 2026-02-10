import { z } from 'zod'
import { ORG_TYPES, TEAM_SIZES } from './organization.constants'

export const organizationSchema = z.object({
  name: z.string().min(1, { message: 'Organization name is required.' }),
  subdomain: z.string().min(1, { message: 'Subdomain is required.' }),
  type: z.enum(ORG_TYPES, {
    message: 'Please select an organization type.',
  }),
  size: z
    .enum(TEAM_SIZES, { message: 'Please select a team size.' })
    .optional(),
})

export type organizationData = z.infer<typeof organizationSchema>
