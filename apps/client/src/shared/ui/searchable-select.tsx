import { formatEnumLabel } from '../lib/format-enum-label'

import { Button } from './button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from './combobox'

interface SearchableSelectFieldProps<T extends string> {
  readonly id: string
  readonly label: string
  readonly value: T
  readonly options: readonly T[]
  readonly placeholder: string
  readonly invalid: boolean
  readonly icon: React.ReactNode
  readonly side?:
    'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'
  readonly onChange: (value: T) => void
}

const SearchableSelect = <T extends string>({
  id,
  label,
  value,
  options,
  placeholder,
  invalid,
  icon,
  side = 'left',
  onChange,
}: SearchableSelectFieldProps<T>) => {
  const displayValue = value ? formatEnumLabel(value) : placeholder

  return (
    <Combobox
      items={options}
      value={value ?? null}
      onValueChange={(nextValue) => {
        if (nextValue !== null) {
          onChange(nextValue)
        }
      }}
      itemToStringValue={(item) => formatEnumLabel(item)}
    >
      <ComboboxTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            size="sm"
            className={[
              'h-8 rounded-full px-2.5',
              'justify-start gap-1.5',
              'font-normal',
              'shadow-none',
              'hover:bg-accent',
              'focus-visible:ring-1',
              invalid ? 'border-destructive' : '',
            ].join(' ')}
            aria-label={`${label}: ${displayValue}`}
            aria-invalid={invalid}
          >
            <span aria-hidden="true" className="flex shrink-0 items-center">
              {icon}
            </span>

            <ComboboxValue placeholder={placeholder}>
              {displayValue}
            </ComboboxValue>
          </Button>
        }
      />

      <ComboboxContent align="start" side={side} className="w-64">
        <div className="p-2">
          <ComboboxInput
            placeholder={`Search ${label.toLowerCase()}`}
            showTrigger={false}
            showClear
            className="h-8"
            autoComplete="off"
            aria-label={`Search ${label.toLowerCase()}`}
          />
        </div>

        <ComboboxEmpty>No {label.toLowerCase()} found.</ComboboxEmpty>

        <ComboboxList className="max-h-52 overflow-y-auto">
          {(option) => (
            <ComboboxItem key={option} value={option}>
              {formatEnumLabel(option)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export { SearchableSelect }
