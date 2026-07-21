"use client"

import * as React from "react"
import { request, useAuthorizedHeaders, ApiError } from "./client"
import { notifyFailed } from "@/lib/notifications"

/** Shared error toast for every failed request — HTTP status as the description when
 * available, so the toast carries the same detail as the inline/console error. */
function notifyRequestFailed(error: Error) {
  notifyFailed(error.message, {
    description: error instanceof ApiError ? `HTTP ${error.status}` : undefined,
  })
}

type QueryOptions = {
  /** When false, the query is not executed until this becomes true. */
  enabled?: boolean
  /** Called with the error whenever the query fails. */
  onError?: (error: Error) => void
}

/**
 * Fetch a single resource or list on mount and whenever `path`/`params`
 * change. Handles loading/error state and envelope unwrapping so pages only
 * declare *what* they want.
 *
 * @example
 * const { data, loading, error, refresh } = useApiQuery<EmployeeResponse>(
 *   "/api/v1/hrms/employees",
 *   { Page: 1, PageSize: 50, SortBy: "id" },
 * )
 */
export function useApiQuery<T>(
  path: string | null | undefined,
  params?: Record<string, string | number | boolean | undefined | null>,
  options: QueryOptions = {},
) {
  const { headers, account } = useAuthorizedHeaders()
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  const enabled = options.enabled ?? true
  const paramsKey = JSON.stringify(params ?? null)

  // Stable ref for onError so it never causes load() to be recreated
  const onErrorRef = React.useRef(options.onError)
  React.useEffect(() => {
    onErrorRef.current = options.onError
  })

  const load = React.useCallback(async () => {
    if (!path || !account || !enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await request<T>(path, headers, { params })
      setData(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      onErrorRef.current?.(error)
      notifyRequestFailed(error)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, account, enabled, headers, paramsKey])

  React.useEffect(() => {
    void load()
  }, [load])

  const refresh = React.useCallback(() => void load(), [load])

  return { data, loading, error, refresh }
}

type MutateParams = {
  path: string
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  params?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
}

/**
 * Execute a one-shot write (POST/PUT/PATCH/DELETE). Does not auto-fetch — call
 * `mutate(...)` from an event handler. Use the returned `refresh` to re-run a
 * paired query after a successful mutation.
 *
 * @example
 * const { mutate, loading } = useApiMutation()
 * await mutate({ path: "/api/identity/roles", method: "POST", body: newRole })
 */
export function useApiMutation() {
  const { headers } = useAuthorizedHeaders()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  // `error` state only reflects the *next* render, so a caller that awaits
  // `mutate(...)` and immediately wants the failure reason (to show a
  // specific message instead of a generic one) should read this ref instead.
  const lastErrorRef = React.useRef<Error | null>(null)

  const mutate = React.useCallback(
    async (params: MutateParams): Promise<boolean> => {
      setLoading(true)
      setError(null)
      lastErrorRef.current = null

      try {
        await request(params.path, headers, {
          method: params.method ?? "POST",
          params: params.params,
          body: params.body,
        })
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        lastErrorRef.current = error
        setError(error)
        notifyRequestFailed(error)
        return false
      } finally {
        setLoading(false)
      }
    },
    [headers],
  )

  const reset = React.useCallback(() => setError(null), [])

  return { mutate, loading, error, reset, lastErrorRef }
}

/**
 * Convenience hook for pages that fire several ad-hoc calls in parallel
 * (e.g. a detail page loading a profile, its documents, history, and
 * interviews at once) and want a thin, authorized client without per-call
 * state management.
 *
 * @example
 * const { query } = useApiClient()
 * const [profile, docs] = await Promise.all([
 *   query<Profile>("/api/v1/core/profiles/1"),
 *   query<Docs>("/api/v1/recruitment/documents"),
 * ])
 */
export function useApiClient() {
  const { headers, account } = useAuthorizedHeaders()

  const query = React.useCallback(
    async <T,>(
      path: string,
      params?: Record<string, string | number | boolean | undefined | null>,
    ): Promise<T> => {
      return request<T>(path, headers, { params })
    },
    [headers],
  )

  const mutate = React.useCallback(
    async (params: MutateParams): Promise<void> => {
      await request(params.path, headers, {
        method: params.method ?? "POST",
        params: params.params,
        body: params.body,
      })
    },
    [headers],
  )

  return { query, mutate, account }
}

export { ApiError }
