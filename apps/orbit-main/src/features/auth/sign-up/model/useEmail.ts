import { useForm } from 'react-hook-form'
import { emailSchema, emailFormData } from './email.schema'
import { zodResolver } from '@hookform/resolvers/zod'

export function useEmail(onSuccess: () => void) {
  const form = useForm<emailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  })

  const submit = (data: emailFormData) => {
    console.log('Form Submitted:', data)
    onSuccess()
  }

  return { form, submit }
}
