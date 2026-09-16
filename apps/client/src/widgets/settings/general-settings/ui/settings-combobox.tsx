'use client'

import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/ui/combobox'

interface SettingOption {
  value: string
  label: string
}

interface SettingComboboxProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  options: readonly SettingOption[]
  searchable?: boolean
}

export const SettingCombobox = <TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  searchable = false,
}: SettingComboboxProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selectedOption = options.find(
          (option) => option.value === field.value
        )

        return (
          <div className="flex min-h-12 items-center justify-between gap-6 border-b py-2">
            <span className="text-sm">{label}</span>

            <Combobox
              items={options}
              value={selectedOption}
              onValueChange={(option) => {
                if (option) {
                  field.onChange(option.value)
                }
              }}
              itemToStringValue={(item) => item.label}
            >
              <ComboboxInput
                className="w-55"
                placeholder={`Select ${label.toLowerCase()}`}
                showClear={false}
                readOnly={!searchable}
              />

              <ComboboxContent>
                <ComboboxEmpty>No options found.</ComboboxEmpty>

                <ComboboxList className="*:cursor-pointer">
                  {(option) => (
                    <ComboboxItem key={option.value} value={option}>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        )
      }}
    />
  )
}
