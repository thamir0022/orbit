'use client'

import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Step } from '@/shared/ui/stepper'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/shared/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import { useSignUpStore } from '../../model/sign-up.store'
import {
  signUpCompleteSchema,
  CompanyType,
  CompanySize,
  type SignUpCompleteData,
} from '../../model/sign-up-complete.schema'
import { useSignUpCompleteMutation } from '../../api/sign-up-complete.mutation'

// Helper functions for labels
const formatTypeLabel = (val: string) =>
  val
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatSizeLabel = (val: string) => {
  if (val === 'solo') return 'Just Me'
  if (val.includes('plus'))
    return val.replace('enterprise_', '').replace('_plus', ' +')
  return val.split('_').slice(1).join(' - ')
}

// Utility to convert text into a valid subdomain
const generateSubdomain = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Convert spaces to hyphens
    .replace(/-+/g, '-') // Prevent consecutive hyphens
    .replace(/^-+/, '') // Remove leading hyphens
}

export function SignUpCompleteStep() {
  const email = useSignUpStore((state) => state.email)
  const registrationToken = useSignUpStore((state) => state.registrationToken)

  const form = useForm<SignUpCompleteData>({
    resolver: zodResolver(signUpCompleteSchema),
    defaultValues: {
      name: '',
      subdomain: '',
    },
  })

  // 1. Watch the name field to trigger auto-generation
  const orgName = form.watch('name')

  // 2. Check if the user has manually touched the subdomain field
  const isSubdomainDirty = form.getFieldState('subdomain').isDirty

  // 3. Auto-fill effect
  React.useEffect(() => {
    // Only auto-fill if the user hasn't manually edited the subdomain
    if (!isSubdomainDirty) {
      const autoSubdomain = generateSubdomain(orgName)
      form.setValue('subdomain', autoSubdomain, {
        shouldValidate: orgName.length > 0, // Only validate if there is text
      })
    }
  }, [orgName, isSubdomainDirty, form])

  const { mutate: completeSignup, isPending } = useSignUpCompleteMutation()

  function onSubmit(data: SignUpCompleteData) {
    if (!email || !registrationToken) return

    // Strip trailing hyphens right before submission (allowed while typing for flow)
    const finalPayload = {
      ...data,
      subdomain: data.subdomain.replace(/-+$/, ''),
      registrationToken,
    }

    completeSignup(finalPayload)
  }

  return (
    <Step>
      <h2 className="text-center mb-5 sub-heading">Create Your Workspace</h2>
      <form
        id="signup-complete-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="org-name">Organization Name</FieldLabel>
                <Input
                  {...field}
                  id="org-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Acme Corp"
                  className="py-6 px-3"
                  autoComplete="organization"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="subdomain"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="subdomain">Workspace URL</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    id="subdomain"
                    aria-invalid={fieldState.invalid}
                    placeholder="my-workspace"
                    className="py-6"
                    // Force input to lowercase visually as they type
                    onChange={(e) => {
                      e.target.value = e.target.value.toLowerCase()
                      field.onChange(e)
                    }}
                  />
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>https://</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>.orbit.com</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="companyType"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Organization Type</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-invalid={fieldState.invalid}
                    className="py-6"
                  >
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="*:cursor-pointer">
                      {Object.values(CompanyType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="companySize"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>How big is your team?</FieldLabel>
                <div className="flex flex-wrap gap-3 *:cursor-pointer">
                  {Object.values(CompanySize).map((size) => (
                    <Badge
                      key={size}
                      variant={field.value === size ? 'default' : 'outline'}
                      onClick={() => field.onChange(size)}
                      className="py-1.5 px-3 text-sm"
                    >
                      {formatSizeLabel(size)}
                    </Badge>
                  ))}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button
            type="submit"
            form="signup-complete-form"
            className="w-full py-6 mt-2 cursor-pointer max-sm:font-bold font-medium"
            disabled={isPending}
          >
            {isPending ? 'Setting up workspace...' : 'Complete Sign Up'}
          </Button>
        </FieldGroup>
      </form>
    </Step>
  )
}
