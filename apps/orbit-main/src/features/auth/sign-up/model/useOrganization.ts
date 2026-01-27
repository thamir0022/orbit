import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { organizationData, organizationSchema } from './organization.schema'

export function useOrganization() {
  const form = useForm<organizationData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
      subdomain: '',
      type: undefined,
      size: undefined,
    },
  })

  const submit = (data: z.infer<typeof organizationSchema>) => {
    console.log(data)
    console.log('Finish')
  }

  return { form, submit }
}
