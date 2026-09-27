'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { signInApi } from '../api/sign-in.api'
import type { SignInFormData } from './sign-in.schema'

export function useSignInMutation() {
  return useMutation({
    mutationFn: (data: SignInFormData) => signInApi(data),

    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
      }
    },
  })
}
