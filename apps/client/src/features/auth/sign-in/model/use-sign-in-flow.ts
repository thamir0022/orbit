'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'

import { SignInFormData, signInSchema } from '../model/sign-in.schema'
import { useSignInMutation } from './sign-in.mutation'
import type { WorkspaceListItem } from '@/entities/workspace'

type Step = 'email' | 'password'

export function useSignInFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = React.useState<Step>('email')
  const [direction, setDirection] = React.useState(0)
  const [workspaces, setWorkspaces] = React.useState<WorkspaceListItem[]>([])

  const { mutate: signIn, isPending: isSigningIn } = useSignInMutation()

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  })

  const redirectUrl = searchParams.get('redirecturl')

  const submitEmail = async () => {
    const isValid = await form.trigger('email')

    if (!isValid) {
      return
    }

    setDirection(1)
    setStep('password')
  }

  const submitPassword = async () => {
    const isValid = await form.trigger('password')

    if (!isValid) {
      return
    }

    const data = form.getValues()

    signIn(data, {
      onSuccess: (res) => {
        if (!res.success) {
          return
        }

        const workspaceList = res.data.workspaces ?? []

        if (workspaceList.length === 0) {
          router.replace('/workspaces/new')
          return
        }

        if (workspaceList.length === 1) {
          router.replace(`/${workspaceList[0].slug}/overview`)
          return
        }

        setWorkspaces(workspaceList)
      },
    })
  }

  const selectWorkspace = (workspace: WorkspaceListItem) => {
    router.replace(`/${workspace.slug}/overview`)
  }

  const closeWorkspaceSelection = () => {
    setWorkspaces([])
  }

  const goBack = () => {
    setDirection(-1)
    setStep('email')
  }

  return {
    state: {
      step,
      direction,
      isSigningIn,
      workspaces,
      isWorkspaceSelectionOpen: workspaces.length > 1,
    },

    form,

    actions: {
      submitEmail,
      submitPassword,
      goBack,
      selectWorkspace,
      closeWorkspaceSelection,
    },
  }
}
