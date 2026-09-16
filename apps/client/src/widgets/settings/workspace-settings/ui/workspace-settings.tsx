'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useWorkspace } from '@/entities/workspace/model/workspace.store'
import { formatTypeLabel } from '@/entities/workspace/lib/utils'
import { CompanySize, CompanyType } from '@/entities/workspace'

import { useEditWorkspaceMutation } from '../model/use-edit-workspace.mutation'
import {
  workspaceSettingsSchema,
  type WorkspaceSettingsFormValues,
} from '../model/workspace-settings.schema'

import { Button } from '@/shared/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui/combobox'
import { Field, FieldContent, FieldError, FieldLabel } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'
import { ScrollArea } from '@/shared/ui/scroll-area'

const COMPANY_TYPE_OPTIONS = Object.values(CompanyType).map((value) => ({
  value,
  label: formatTypeLabel(value),
}))

const COMPANY_SIZE_OPTIONS = Object.values(CompanySize).map((value) => ({
  value,
  label: formatTypeLabel(value),
}))

const getDefaultValues = (
  workspace: ReturnType<typeof useWorkspace>
): WorkspaceSettingsFormValues => ({
  name: workspace?.name ?? '',
  slug: workspace?.slug ?? '',
  companyType: workspace?.companyType,
  companySize: workspace?.companySize,
  defaultPointsPerMemberPerDay:
    workspace?.settings?.defaultPointsPerMemberPerDay ?? 0,
  defaultHoursPerDay: workspace?.settings?.defaultHoursPerDay ?? 0,
  defaultWorkingDaysPerWeek:
    workspace?.settings?.defaultWorkingDaysPerWeek ?? 0,
  defaultWorkingDaysPerSprint:
    workspace?.settings?.defaultWorkingDaysPerSprint ?? 0,
})

export const WorkspaceSettings = () => {
  const workspace = useWorkspace()

  const { mutateAsync: updateWorkspace, isPending } = useEditWorkspaceMutation()

  const form = useForm<WorkspaceSettingsFormValues>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: getDefaultValues(workspace),
    mode: 'onChange',
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, isValid },
  } = form

  const onSubmit = async (values: WorkspaceSettingsFormValues) => {
    const updatedWorkspace = await updateWorkspace({
      name: values.name.trim(),
      slug: values.slug.trim(),
      companyType: values.companyType || undefined,
      companySize: values.companySize || undefined,
      settings: {
        defaultPointsPerMemberPerDay: values.defaultPointsPerMemberPerDay,
        defaultHoursPerDay: values.defaultHoursPerDay,
        defaultWorkingDaysPerWeek: values.defaultWorkingDaysPerWeek,
        defaultWorkingDaysPerSprint: values.defaultWorkingDaysPerSprint,
      },
    })

    reset(getDefaultValues(updatedWorkspace))
  }

  const handleCancel = () => {
    reset(getDefaultValues(workspace))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full p-2">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">Workspace</h1>

        <p className="text-muted-foreground mt-1 text-sm">
          Manage your workspace details and defaults.
        </p>
      </div>

      {/* Workspace information */}
      <section>
        <h2 className="text-lg font-medium">Workspace Information</h2>

        <div className="mt-3 space-y-2">
          {/* Name */}
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between border-b py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-44">
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="max-w-sm"
                />
              </Field>
            )}
          />

          {/* Slug */}
          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between border-b py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-44">
                  <FieldLabel htmlFor={field.name}>Slug</FieldLabel>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="max-w-sm"
                />
              </Field>
            )}
          />

          {/* Company type */}
          <Controller
            name="companyType"
            control={control}
            render={({ field, fieldState }) => {
              const selectedOption = COMPANY_TYPE_OPTIONS.find(
                (option) => option.value === field.value
              )

              return (
                <Field
                  orientation="horizontal"
                  className="min-h-14 justify-between border-b py-2"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent className="my-auto min-w-44">
                    <FieldLabel>Company Type</FieldLabel>

                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </FieldContent>

                  <Combobox
                    items={COMPANY_TYPE_OPTIONS}
                    value={selectedOption}
                    onValueChange={(option) => {
                      field.onChange(option?.value ?? '')
                    }}
                    itemToStringValue={(item) => item.label}
                  >
                    <ComboboxInput
                      className="w-60"
                      placeholder="Select compxany type"
                      showClear={false}
                      readOnly
                      aria-invalid={fieldState.invalid}
                    />

                    <ComboboxContent>
                      <ComboboxEmpty>No company type found.</ComboboxEmpty>

                      <ScrollArea className="h-52">
                        <ComboboxList>
                          {(option) => (
                            <ComboboxItem key={option.value} value={option}>
                              {option.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ScrollArea>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              )
            }}
          />

          {/* Company size */}
          <Controller
            name="companySize"
            control={control}
            render={({ field, fieldState }) => {
              const selectedOption = COMPANY_SIZE_OPTIONS.find(
                (option) => option.value === field.value
              )

              return (
                <Field
                  orientation="horizontal"
                  className="min-h-14 justify-between py-2"
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent className="my-auto min-w-44">
                    <FieldLabel>Company Size</FieldLabel>

                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </FieldContent>

                  <Combobox
                    items={COMPANY_SIZE_OPTIONS}
                    value={selectedOption}
                    onValueChange={(option) => {
                      field.onChange(option?.value ?? '')
                    }}
                    itemToStringValue={(item) => item.label}
                  >
                    <ComboboxInput
                      className="w-60"
                      placeholder="Select company size"
                      showClear={false}
                      readOnly
                      aria-invalid={fieldState.invalid}
                    />

                    <ComboboxContent>
                      <ComboboxEmpty>No company size found.</ComboboxEmpty>

                      <ScrollArea className="h-52">
                        <ComboboxList>
                          {(option) => (
                            <ComboboxItem key={option.value} value={option}>
                              {option.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ScrollArea>
                    </ComboboxContent>
                  </Combobox>
                </Field>
              )
            }}
          />
        </div>
      </section>

      <Separator className="my-4" />

      {/* Planning defaults */}
      <section>
        <h2 className="text-lg font-medium">Planning Defaults</h2>

        <div className="mt-3 space-y-2">
          {/* Points per member / day */}
          <Controller
            name="defaultPointsPerMemberPerDay"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between border-b py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-44">
                  <FieldLabel htmlFor={field.name}>
                    Points per member / day
                  </FieldLabel>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  id={field.name}
                  type="number"
                  min={0}
                  step={0.5}
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(
                      event.target.value === '' ? 0 : Number(event.target.value)
                    )
                  }}
                  aria-invalid={fieldState.invalid}
                  className="max-w-sm"
                />
              </Field>
            )}
          />

          {/* Hours per day */}
          <Controller
            name="defaultHoursPerDay"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between border-b py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-44">
                  <FieldLabel htmlFor={field.name}>Hours per day</FieldLabel>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  id={field.name}
                  type="number"
                  min={0}
                  step={0.5}
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(
                      event.target.value === '' ? 0 : Number(event.target.value)
                    )
                  }}
                  aria-invalid={fieldState.invalid}
                  className="max-w-sm"
                />
              </Field>
            )}
          />

          {/* Working days / week */}
          <Controller
            name="defaultWorkingDaysPerWeek"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between border-b py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-44">
                  <FieldLabel htmlFor={field.name}>
                    Working days / week
                  </FieldLabel>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  id={field.name}
                  type="number"
                  min={1}
                  max={7}
                  step={1}
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(
                      event.target.value === '' ? 0 : Number(event.target.value)
                    )
                  }}
                  aria-invalid={fieldState.invalid}
                  className="max-w-sm"
                />
              </Field>
            )}
          />

          {/* Working days / sprint */}
          <Controller
            name="defaultWorkingDaysPerSprint"
            control={control}
            render={({ field, fieldState }) => (
              <Field
                orientation="horizontal"
                className="min-h-14 justify-between py-2"
                data-invalid={fieldState.invalid}
              >
                <FieldContent className="my-auto min-w-44">
                  <FieldLabel htmlFor={field.name}>
                    Working days / sprint
                  </FieldLabel>

                  {fieldState.invalid && (
                    <FieldError>{fieldState.error?.message}</FieldError>
                  )}
                </FieldContent>

                <Input
                  id={field.name}
                  type="number"
                  min={1}
                  step={1}
                  value={field.value}
                  onChange={(event) => {
                    field.onChange(
                      event.target.value === '' ? 0 : Number(event.target.value)
                    )
                  }}
                  aria-invalid={fieldState.invalid}
                  className="max-w-sm"
                />
              </Field>
            )}
          />
        </div>
      </section>

      <Separator className="my-8" />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {isDirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting || isPending}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={!isDirty || !isValid || isSubmitting || isPending}
          isLoading={isSubmitting || isPending}
        >
          Save
        </Button>
      </div>
    </form>
  )
}
