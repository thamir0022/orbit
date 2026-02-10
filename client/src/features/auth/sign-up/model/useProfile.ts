import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { profileData, profileSchema } from './profile.schema'

export function useProfile(onSuccess: () => void) {
  const form = useForm<profileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  })

  const submit = (data: profileData) => {
    console.log(data)
    onSuccess()
  }

  return { form, submit }
}
