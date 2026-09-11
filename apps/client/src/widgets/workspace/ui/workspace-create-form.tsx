'use client'

import {
  CompanySize,
  CompanyType,
  formatSizeLabel,
  formatTypeLabel,
  generateSlug,
} from '@/entities/workspace'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Controller, useForm, useWatch } from 'react-hook-form'
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CreateWorkspaceData,
  createWorkspaceSchema,
} from '@/entities/workspace/model/create-workspace.schema'

export interface WorkspaceCreateFormProps {
  title?: string
  onSubmit: (data: CreateWorkspaceData) => void
  isLoading: boolean
}

export const WorkspaceCreateForm = ({
  title = 'Create Your Workspace',
  onSubmit,
  isLoading,
}: WorkspaceCreateFormProps) => {
  const { control, handleSubmit, setValue } = useForm<CreateWorkspaceData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  const slugEditedRef = React.useRef(false)

  const orgName = useWatch({
    control: control,
    name: 'name',
    defaultValue: '',
  })

  React.useEffect(() => {
    if (!slugEditedRef.current) {
      setValue('slug', generateSlug(orgName))
    }
  }, [orgName, setValue])

  return (
    <div className="w-sm m-auto">
      <h2 className="text-xl font-semibold text-center mb-5 sub-heading">
        {title}
      </h2>
      <form
        id="create-workspace-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <FieldGroup className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="org-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="org-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Workspace Name"
                  className="py-6 px-3"
                  autoComplete="workspace"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="slug">Slug</FieldLabel>
                <Input
                  {...field}
                  id="slug"
                  onChange={(e) => {
                    slugEditedRef.current = true
                    field.onChange(e)
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="workspace-slug"
                  className="py-6 px-3"
                  autoComplete="workspace"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="companyType"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Type</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-invalid={fieldState.invalid}
                    className="py-6"
                  >
                    <SelectValue placeholder="Select workspace type" />
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
            control={control}
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
            form="create-workspace-form"
            className="w-full py-6 mt-2 cursor-pointer max-sm:font-bold font-medium"
            isLoading={isLoading}
          >
            Create Workspace
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
