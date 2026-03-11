import { z } from 'zod'

export enum CompanySize {
  SOLO = 'solo',
  SMALL_2_10 = 'small_2_10',
  SMALL_11_50 = 'small_11_50',
  MEDIUM_51_100 = 'medium_51_100',
  MEDIUM_101_250 = 'medium_101_250',
  LARGE_251_500 = 'large_251_500',
  ENTERPRISE_500_PLUS = 'enterprise_500_plus',
}

export enum CompanyType {
  STARTUP = 'startup',
  SME = 'sme',
  ENTERPRISE = 'enterprise',
  NON_PROFIT = 'non_profit',
  GOVERNMENT = 'government',
  AGENCY = 'agency',
  EDUCATIONAL = 'educational',
  FREELANCER = 'freelancer',
  OTHER = 'other',
}

export const signUpCompleteSchema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  subdomain: z
    .string()
    .min(3, 'Subdomain must be at least 3 characters')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Only lowercase letters, numbers, and hyphens allowed (cannot start/end with hyphen)'
    ),
  companyType: z.nativeEnum(CompanyType, {
    required_error: 'Please select an organization type',
  }),
  companySize: z.nativeEnum(CompanySize, {
    required_error: 'Please select a team size',
  }),
})

export type SignUpCompleteData = z.infer<typeof signUpCompleteSchema>
