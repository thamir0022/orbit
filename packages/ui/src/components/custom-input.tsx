import * as React from "react"
import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
} from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@orbit/ui/components/field"
import { Input } from "@orbit/ui/components/input"


interface CustomInputProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label: string
  description?: string
  placeholder?: string
  className?: string
  type?: React.HTMLInputTypeAttribute
  // Any native input props (like autoComplete, disabled, etc.)
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export function CustomInput<T extends FieldValues>({
  name,
  control,
  label,
  description,
  className,
  placeholder,
  type = "text",
  inputProps,
}: CustomInputProps<T>) {
  const id = React.useId()
  const errorId = `${id}-error`
  const descriptionId = `${id}-description`

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const isError = !!error

        return (
          <Field className={className} data-invalid={isError}>
            <FieldLabel htmlFor={id}>
              {label}
            </FieldLabel>

            <Input
              {...field}       // Safe to spread for standard Inputs
              {...inputProps}  // Spread extra native props (e.g. disabled)
              id={id}
              type={type}
              placeholder={placeholder}
              aria-invalid={isError}
              aria-describedby={
                isError ? errorId : description ? descriptionId : undefined
              }
              value={field.value ?? ""} // Null safety
            />

            {description && (
              <FieldDescription id={descriptionId}>
                {description}
              </FieldDescription>
            )}

            {error && <FieldError id={errorId} errors={[error]} />}
          </Field>
        )
      }}
    />
  )
}