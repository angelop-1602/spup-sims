import type {
  AccountInfo,
  IPublicClientApplication,
} from "@azure/msal-browser"

import { loginRequest } from "@/lib/authConfig"
import type { components } from "@/lib/api/schema"

const HRM_ACCESS_CACHE_KEY = "spup:sims:hrm-access"

export type CurrentUser = components["schemas"]["CurrentUserResponse"]

type CachedHrmAccess = {
  accountKey: string
  user: CurrentUser
}

export type HrmAccessResult =
  | {
      ok: true
      user: CurrentUser
    }
  | {
      ok: false
      message: string
    }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function getNullableString(value: unknown) {
  return typeof value === "string" ? value : null
}

function getNullableId(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? value : null
}

function getAccountKey(account: AccountInfo) {
  return account.homeAccountId || account.localAccountId || account.username
}

function unwrapUserPayload(payload: unknown) {
  if (!isRecord(payload)) {
    return null
  }

  const data = payload.data
  if (isRecord(data) && isRecord(data.data)) {
    return data.data
  }

  return isRecord(data) ? data : payload
}

function parseCurrentUser(payload: unknown): CurrentUser | null {
  if (!isRecord(payload)) {
    return null
  }

  const roles = getStringArray(payload.roles)
  const permissions = getStringArray(payload.permissions)

  if (!roles.length && !Array.isArray(payload.roles)) {
    return null
  }

  if (!permissions.length && !Array.isArray(payload.permissions)) {
    return null
  }

  return {
    userId: getNullableId(payload.userId),
    profileId: getNullableId(payload.profileId),
    email: getNullableString(payload.email),
    azureId: getNullableString(payload.azureId),
    roles,
    permissions,
    departments: Array.isArray(payload.departments) ? payload.departments as CurrentUser["departments"] : [],
    isSuperAdmin: payload.isSuperAdmin === true,
  }
}

export function readCachedHrmAccess(account: AccountInfo | null | undefined) {
  if (typeof window === "undefined" || !account) {
    return null
  }

  try {
    const cached = JSON.parse(
      window.sessionStorage.getItem(HRM_ACCESS_CACHE_KEY) ?? "null"
    ) as CachedHrmAccess | null

    if (cached?.accountKey === getAccountKey(account)) {
      return cached.user
    }
  } catch {
    window.sessionStorage.removeItem(HRM_ACCESS_CACHE_KEY)
  }

  return null
}

export function clearCachedHrmAccess() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(HRM_ACCESS_CACHE_KEY)
  }
}

function cacheHrmAccess(account: AccountInfo, user: CurrentUser) {
  if (typeof window === "undefined") {
    return
  }

  const cached: CachedHrmAccess = {
    accountKey: getAccountKey(account),
    user,
  }

  window.sessionStorage.setItem(HRM_ACCESS_CACHE_KEY, JSON.stringify(cached))
}

export async function verifyHrmAccess(
  instance: IPublicClientApplication,
  account: AccountInfo
): Promise<HrmAccessResult> {
  try {
    const result = await instance.acquireTokenSilent({
      scopes: loginRequest.scopes,
      account,
    })

    const response = await fetch("/api/me", {
      headers: {
        Authorization: `Bearer ${result.accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      clearCachedHrmAccess()

      return {
        ok: false,
        message:
          response.status === 404
            ? "Your account is not registered in the HRM database."
            : "You do not have permission to access this application.",
      }
    }

    const payload = (await response.json()) as unknown
    const user = parseCurrentUser(unwrapUserPayload(payload))

    if (!user) {
      clearCachedHrmAccess()

      return {
        ok: false,
        message: "Unable to verify your HRM access.",
      }
    }

    cacheHrmAccess(account, user)

    return {
      ok: true,
      user,
    }
  } catch (error) {
    clearCachedHrmAccess()

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify your HRM access.",
    }
  }
}
