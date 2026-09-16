'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/shared/ui/button'

import { Separator } from '@/shared/ui/separator'
import { ThemeToggle } from '@/shared/ui/theme-toggle'

import {
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  TIME_FORMAT_OPTIONS,
  TIMEZONE_OPTIONS,
} from '../model/general-settings.options'

import {
  generalSettingsSchema,
  type GeneralSettingsFormValues,
} from '../model/general-settings.schema'
import { SettingCombobox } from './settings-combobox'

const DEFAULT_VALUES: GeneralSettingsFormValues = {
  language: 'en',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12-hour',
}

interface GeneralSettingsProps {
  initialValues?: Partial<GeneralSettingsFormValues>
}

export const GeneralSettings = ({ initialValues }: GeneralSettingsProps) => {
  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      ...initialValues,
    },
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = form

  const onSubmit = async (values: GeneralSettingsFormValues) => {
    // await updateGeneralSettings(values)

    reset(values)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full p-2"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">
          General Settings
        </h1>

        <p className="text-muted-foreground mt-1 text-sm">
          Customize your Orbit experience.
        </p>
      </div>

      {/* Appearance */}
      <section>
        <h2 className="text-sm font-medium">Appearance</h2>

        <div className="mt-3">
          <div className="flex min-h-12 items-center justify-between gap-6 py-2">
            <span className="text-sm">Theme</span>

            <ThemeToggle toggleType="toggle" />
          </div>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Language & Region */}
      <section>
        <h2 className="text-sm font-medium">Language & Region</h2>

        <div className="mt-3">
          <SettingCombobox
            control={control}
            name="language"
            label="Language"
            options={LANGUAGE_OPTIONS}
          />

          <SettingCombobox
            control={control}
            name="timezone"
            label="Timezone"
            options={TIMEZONE_OPTIONS}
            searchable
          />

          <SettingCombobox
            control={control}
            name="dateFormat"
            label="Date format"
            options={DATE_FORMAT_OPTIONS}
          />

          <SettingCombobox
            control={control}
            name="timeFormat"
            label="Time format"
            options={TIME_FORMAT_OPTIONS}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={!isDirty} isLoading={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  )
}
