'use client'

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type {
  ProjectPriority,
  ProjectStage,
  ProjectStatus,
  ProjectType,
} from '@/entities/project/model/project.types'

import type {
  ProjectQueryParams,
  ProjectSortField,
  ProjectSortOrder,
} from '../model/project-filter.types'

import { PROJECT_SORT_FIELDS } from '../model/project-filter.types'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 50
const SEARCH_DEBOUNCE_MS = 300

const PROJECT_SORT_FIELD_SET = new Set<string>(PROJECT_SORT_FIELDS)

const parsePositiveInteger = (
  value: string | null,
  fallback: number
): number => {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const parseArrayParam = (
  searchParams: URLSearchParams,
  key: string
): string[] => {
  const value = searchParams.get(key)

  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const parseSortField = (value: string | null): ProjectSortField | undefined => {
  if (value && PROJECT_SORT_FIELD_SET.has(value)) {
    return value as ProjectSortField
  }

  return undefined
}

const parseSortOrder = (value: string | null): ProjectSortOrder | undefined => {
  if (value === 'asc' || value === 'desc') {
    return value
  }

  return undefined
}

export const useProjectFilters = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()

  const searchFromUrl = searchParams.get('search') ?? ''

  const [search, setSearch] = useState(searchFromUrl)

  useEffect(() => {
    setSearch(searchFromUrl)
  }, [searchFromUrl])

  const updateParams = useCallback(
    (
      updates: Record<string, string | string[] | null | undefined>,
      options: {
        readonly resetPage?: boolean
      } = {}
    ) => {
      const nextParams = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        const shouldDelete =
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)

        if (shouldDelete) {
          nextParams.delete(key)
          return
        }

        nextParams.set(key, Array.isArray(value) ? value.join(',') : value)
      })

      if (options.resetPage !== false) {
        nextParams.delete('page')
      }

      const queryString = nextParams.toString()

      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        })
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const normalizedSearch = search.trim()

    if (normalizedSearch === searchFromUrl) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      updateParams({
        search: normalizedSearch || null,
      })
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [search, searchFromUrl, updateParams])

  const params = useMemo<ProjectQueryParams>(() => {
    const sortField = parseSortField(searchParams.get('sortField'))

    const sortOrder = parseSortOrder(searchParams.get('sortOrder'))

    return {
      page: parsePositiveInteger(searchParams.get('page'), DEFAULT_PAGE),

      limit: parsePositiveInteger(searchParams.get('limit'), DEFAULT_LIMIT),

      search: searchFromUrl || undefined,

      types: parseArrayParam(searchParams, 'types') as ProjectType[],

      stages: parseArrayParam(searchParams, 'stages') as ProjectStage[],

      priorities: parseArrayParam(
        searchParams,
        'priorities'
      ) as ProjectPriority[],

      statuses: parseArrayParam(searchParams, 'statuses') as ProjectStatus[],

      leadId: searchParams.get('leadId') ?? undefined,

      startDateFrom: searchParams.get('startDateFrom') ?? undefined,

      startDateTo: searchParams.get('startDateTo') ?? undefined,

      targetEndDateFrom: searchParams.get('targetEndDateFrom') ?? undefined,

      targetEndDateTo: searchParams.get('targetEndDateTo') ?? undefined,

      sortField,

      sortOrder,
    }
  }, [searchParams, searchFromUrl])

  const clearFilters = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString())

    const filterKeys = [
      'search',
      'types',
      'stages',
      'priorities',
      'statuses',
      'leadId',
      'startDateFrom',
      'startDateTo',
      'targetEndDateFrom',
      'targetEndDateTo',
    ]

    filterKeys.forEach((key) => {
      nextParams.delete(key)
    })

    nextParams.delete('page')

    setSearch('')

    const queryString = nextParams.toString()

    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      })
    })
  }, [pathname, router, searchParams])

  return {
    params,

    search,
    setSearch,

    isPending,

    updateParams,

    clearFilters,
  }
}
