"use client";

import * as React from "react";
import { useMsal } from "@azure/msal-react";
import type { components } from "./schema";
import { url } from "inspector/promises";

/**
 * Error thrown by {@link request} when the response is not OK or the API
 * reports `success: false`. Carries the HTTP status and any parsed detail so
 * callers can branch on the failure reason.
 */
export class ApiError extends Error {
  status: number;
  detail?: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Scopes used to acquire an access token for API calls. Mirrors the pattern
 * used across the HRM pages: a comma/space-separated env var with a
 * `User.Read` fallback.
 */
const API_SCOPES = process.env.NEXT_PUBLIC_API_SCOPES?.split(/[\s,]+/).filter(
  Boolean,
) ?? ["User.Read"];

type ApiEnvelope = components["schemas"]["ApiResponseOfAttendanceResponse"];

/**
 * Returns a memoized callback that acquires a bearer token for the current
 * account and returns the standard request headers. Throws if no account is
 * available so callers fail fast instead of sending an unauthenticated
 * request.
 */
export function useAuthorizedHeaders() {
  const { accounts, instance } = useMsal();
  const account = accounts[0];

  const headers = React.useCallback(async () => {
    if (!account) {
      throw new Error("No authenticated account available");
    }

    const result = await instance.acquireTokenSilent({
      scopes: API_SCOPES,
      account,
    });

    return {
      Authorization: `Bearer ${result.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }, [account, instance]);

  return { headers, account };
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Thin, typed wrapper around `fetch` for the SIMS API.
 *
 * - Builds the URL from a relative path (proxied by the Next.js rewrite to the
 *   upstream API) and an optional query-string params object.
 * - Acquests an auth header via the injected `authorize` callback.
 * - Throws {@link ApiError} on a non-2xx response.
 * - Unwraps the `{ success, data }` envelope: a `success: false` response is
 *   thrown, otherwise the `data` field is returned typed as `T`.
 *
 * The `authorize` callback is injected (rather than calling MSAL directly) so
 * the client stays framework-agnostic and unit-testable.
 */
export async function request<T>(
  path: string,
  authorize: () => Promise<Record<string, string>>,
  { method = "GET", params, body, signal }: RequestOptions = {},
): Promise<T> {
  const url = new URL(path, window.location.origin);

  if (params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      search.set(key, String(value));
    }
    url.search = search.toString();
  }

  const headers = await authorize();
  const isFormData = body instanceof FormData;

  if (isFormData) {
    // Let fetch set its own Content-Type with the multipart boundary.
    delete headers["Content-Type"];
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    cache: "no-store",
    signal,
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  let payload: ApiEnvelope | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope;
  } catch {
    // Non-JSON response (e.g. an empty body on 240/304). Fall through to the
    // status-based error below.
  }

  if (!response.ok) {
    const message =
      (payload && typeof payload.message === "string" && payload.message) ||
      `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  if (payload && payload.success === false) {
    throw new ApiError(
      payload.message || "Request failed",
      response.status,
      payload,
    );
  }

  return (payload?.data ?? null) as T;
}

