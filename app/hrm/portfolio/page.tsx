"use client"

import * as React from "react"
import { useMsal } from "@azure/msal-react"
import { EmployeePortfolioDetails } from "@/components/hrm/employee-portfolio-details"
import type { components } from "@/src/lib/api/schema"

const API_SCOPES =
  process.env.NEXT_PUBLIC_API_SCOPES?.split(/[\s,]+/).filter(Boolean) ?? [
    "User.Read",
  ]

type EmployeeResponse = components["schemas"]["EmployeeResponse"]

type PortfolioState = {
  profile: EmployeeResponse | null
  loading: boolean
  error: string | null
}

export default function EmployeePortfolioPage() {
  const { accounts, instance } = useMsal()
  const account = accounts[0]

  const [state, setState] = React.useState<PortfolioState>({
    profile: null,
    loading: true,
    error: null,
  })

  const authorizedHeaders = React.useCallback(async () => {
    if (!account) {
      throw new Error("No authenticated account available")
    }

    const result = await instance.acquireTokenSilent({
      account,
      scopes: API_SCOPES,
    })

    return {
      Authorization: `Bearer ${result.accessToken}`,
      Accept: "application/json",
    }
  }, [account, instance])

  const loadProfile = React.useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }))

    if (!account) {
      setState({ profile: null, loading: false, error: "No authenticated user." })
      return
    }

    try {
      const headers = await authorizedHeaders()

      const response = await fetch("/api/hrms/me/profile", {
        headers,
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to load profile (${response.status})`)
      }

      const payload = (await response.json()) as {
        data: EmployeeResponse | null
      }

      setState({ profile: payload.data, loading: false, error: null })
    } catch (error) {
      setState({
        profile: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load employee portfolio.",
      })
    }
  }, [account, authorizedHeaders])

  React.useEffect(() => {
    void loadProfile()
    console.log("mounted")

    return () => {
      console.log("unmounted")
    }
  }, [loadProfile])

  const { profile, loading, error } = state
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          Employee Portfolio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your authenticated portfolio profile and employment details.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          Loading portfolio...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : profile ? (
        <EmployeePortfolioDetails profile={profile} />
      ) : (
        <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          No portfolio data found.
        </div>
      )}
    </div>
  )
}

