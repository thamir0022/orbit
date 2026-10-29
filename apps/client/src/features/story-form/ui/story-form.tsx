'use client'
import { useId, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type Values } from '../model/story.schema'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Field, FieldLabel, FieldError } from '@/shared/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { WORK_ITEM_PRIORITIES, WORK_ITEM_STATUSES } from '@/entities/work-item'
import type {
  StoryDetail,
  StoryInput,
} from '@/entities/story/api/story-detail.api'
export function StoryForm({
  story,
  onSave,
  pending,
}: {
  story?: StoryDetail
  onSave: (input: StoryInput) => Promise<void>
  pending: boolean
}) {
  const id = useId()
  const [message, setMessage] = useState('')
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: story?.title ?? '',
      description: story?.description ?? '',
      priority: story?.priority ?? 'none',
      storyPoints: story?.storyPoints?.toString() ?? '',
      status: story?.status ?? 'backlog',
    },
  })
  const submit = handleSubmit(async (values) => {
    setMessage('')
    try {
      await onSave({
        title: values.title,
        description: values.description,
        priority: values.priority === 'none' ? null : values.priority,
        storyPoints:
          values.storyPoints === '' ? null : Number(values.storyPoints),
        ...(story ? { status: values.status } : {}),
      })
      reset(values)
      setMessage('Changes saved')
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to save story'
      )
    }
  })
  return (
    <form onSubmit={submit} className="space-y-6" aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-6">
        <Field>
          <FieldLabel htmlFor={id + 'title'}>Title</FieldLabel>
          <Input
            id={id + 'title'}
            {...register('title')}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? id + 'title-error' : undefined}
            placeholder="What needs to be done?"
            className="h-12 text-base"
          />
          <FieldError id={id + 'title-error'} errors={[errors.title]} />
        </Field>
        <Field>
          <FieldLabel htmlFor={id + 'description'}>Description</FieldLabel>
          <Textarea
            id={id + 'description'}
            {...register('description')}
            aria-invalid={!!errors.description}
            placeholder="Add context, goals, and details…"
            className="min-h-48 resize-y"
          />
          <FieldError errors={[errors.description]} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          {(['priority', ...(story ? (['status'] as const) : [])] as const).map(
            (name) => (
              <Field key={name}>
                <FieldLabel htmlFor={id + name} className="capitalize">
                  {name}
                </FieldLabel>
                <Controller
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={id + name} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(name === 'priority'
                          ? ['none', ...Object.values(WORK_ITEM_PRIORITIES)]
                          : Object.values(WORK_ITEM_STATUSES)
                        ).map((value) => (
                          <SelectItem key={value} value={value}>
                            {value.replaceAll('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )
          )}
          <Field>
            <FieldLabel htmlFor={id + 'points'}>Story points</FieldLabel>
            <Input
              id={id + 'points'}
              type="number"
              min={1}
              max={1000}
              {...register('storyPoints')}
              aria-invalid={!!errors.storyPoints}
              placeholder="No estimate"
            />
            <FieldError errors={[errors.storyPoints]} />
          </Field>
        </div>
      </fieldset>
      <div
        role="status"
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        {message}
      </div>
      <div className="flex justify-end border-t pt-4">
        <Button disabled={pending || (!!story && !isDirty)} type="submit">
          {pending ? 'Saving…' : story ? 'Save changes' : 'Create story'}
        </Button>
      </div>
    </form>
  )
}
