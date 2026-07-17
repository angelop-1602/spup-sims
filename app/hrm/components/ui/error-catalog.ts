import type { LucideIcon } from "lucide-react"
import {
  CircleAlert,
  FileQuestion,
  ServerCrash,
  ShieldAlert,
} from "lucide-react"

export const CLIENT_ERROR_CODES = [
  400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413,
  414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431,
  451,
] as const

export const SERVER_ERROR_CODES = [
  500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511,
] as const

export const HTTP_ERROR_CODES = [
  ...CLIENT_ERROR_CODES,
  ...SERVER_ERROR_CODES,
] as const

export const APPLICATION_ERROR_CODES = [
  "offline",
  "network",
  "timeout",
  "unknown",
] as const

export type ErrorCode = (typeof HTTP_ERROR_CODES)[number]
export type ApplicationErrorCode = (typeof APPLICATION_ERROR_CODES)[number]
export type ErrorIdentifier = number | ApplicationErrorCode
export type ErrorAction = "back" | "retry" | "home"

export type ErrorConfig = {
  title: string
  description: string
  icon: LucideIcon
  primaryAction?: ErrorAction
  secondaryAction?: Exclude<ErrorAction, "retry">
}

const CLIENT_ERROR = {
  icon: CircleAlert,
  primaryAction: "back",
} as const

const RETRYABLE_CLIENT_ERROR = {
  icon: CircleAlert,
  primaryAction: "retry",
  secondaryAction: "back",
} as const

const SERVER_ERROR = {
  icon: ServerCrash,
  primaryAction: "retry",
  secondaryAction: "back",
} as const

const ERROR_CONFIG: Record<ErrorCode, ErrorConfig> = {
  400: {
    ...CLIENT_ERROR,
    title: "Invalid request",
    description: "The request could not be understood. Review the information and try again.",
  },
  401: {
    icon: ShieldAlert,
    title: "Sign-in required",
    description: "Sign in with an authorized account to continue.",
    primaryAction: "home",
    secondaryAction: "back",
  },
  402: {
    ...CLIENT_ERROR,
    title: "Payment required",
    description: "This request requires payment or an active billing arrangement.",
  },
  403: {
    icon: ShieldAlert,
    title: "Access unavailable",
    description: "Your account does not have permission to view this content.",
    primaryAction: "home",
    secondaryAction: "back",
  },
  404: {
    icon: FileQuestion,
    title: "Page not found",
    description: "This page or record does not exist, or it may have moved.",
    primaryAction: "back",
    secondaryAction: "home",
  },
  405: {
    ...CLIENT_ERROR,
    title: "Action not allowed",
    description: "This action is not supported for the requested resource.",
  },
  406: {
    ...CLIENT_ERROR,
    title: "Response format unavailable",
    description: "The requested response format is not available.",
  },
  407: {
    ...RETRYABLE_CLIENT_ERROR,
    icon: ShieldAlert,
    title: "Proxy authentication required",
    description: "The network proxy requires authentication before this request can continue.",
  },
  408: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Request timed out",
    description: "The server waited too long for the request. Check your connection and try again.",
  },
  409: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Update conflict",
    description: "The record changed before this request completed. Refresh and try again.",
  },
  410: {
    icon: FileQuestion,
    title: "Content no longer available",
    description: "This content was permanently removed and is no longer available.",
    primaryAction: "back",
    secondaryAction: "home",
  },
  411: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Request length required",
    description: "The server requires the request size before it can continue.",
  },
  412: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Request condition failed",
    description: "A condition required for this request is no longer valid.",
  },
  413: {
    ...CLIENT_ERROR,
    title: "File or request too large",
    description: "Reduce the file size or request content, then try again.",
  },
  414: {
    ...CLIENT_ERROR,
    title: "Address too long",
    description: "The requested address is too long for the server to process.",
  },
  415: {
    ...CLIENT_ERROR,
    title: "File type not supported",
    description: "Use a supported file or content type and try again.",
  },
  416: {
    ...CLIENT_ERROR,
    title: "Requested range unavailable",
    description: "The requested portion of this file or resource is unavailable.",
  },
  417: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Request expectation failed",
    description: "The server could not meet a requirement included with this request.",
  },
  418: {
    ...CLIENT_ERROR,
    title: "Request refused",
    description: "The server refused this intentionally unsupported request.",
  },
  421: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Request sent to the wrong service",
    description: "The request reached a server that cannot produce this response.",
  },
  422: {
    ...CLIENT_ERROR,
    title: "Information could not be processed",
    description: "Review the submitted information and correct any invalid values.",
  },
  423: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Resource locked",
    description: "This record is temporarily locked by another operation.",
  },
  424: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Required operation failed",
    description: "A related operation failed, so this request could not be completed.",
  },
  425: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Request submitted too early",
    description: "The server is not ready to safely process this request yet.",
  },
  426: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Protocol upgrade required",
    description: "A newer connection protocol is required to continue.",
  },
  428: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Request condition required",
    description: "Refresh the resource and retry with its current version.",
  },
  429: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Too many requests",
    description: "Too many requests were made in a short time. Wait a moment and try again.",
  },
  431: {
    ...CLIENT_ERROR,
    title: "Request headers too large",
    description: "The request contains more header information than the server can accept.",
  },
  451: {
    icon: ShieldAlert,
    title: "Content unavailable",
    description: "This content cannot be provided because of a legal restriction.",
    primaryAction: "back",
    secondaryAction: "home",
  },
  500: {
    ...SERVER_ERROR,
    title: "Something went wrong",
    description: "The server could not complete the request. Please try again.",
  },
  501: {
    ...SERVER_ERROR,
    title: "Feature not supported",
    description: "The server does not support this operation yet.",
  },
  502: {
    ...SERVER_ERROR,
    title: "Upstream service error",
    description: "A connected service returned an invalid response. Please try again.",
  },
  503: {
    ...SERVER_ERROR,
    title: "Service temporarily unavailable",
    description: "The service is busy or undergoing maintenance. Please try again shortly.",
  },
  504: {
    ...SERVER_ERROR,
    title: "Service timed out",
    description: "A connected service took too long to respond. Please try again.",
  },
  505: {
    ...SERVER_ERROR,
    title: "HTTP version not supported",
    description: "The server does not support the HTTP version used by this request.",
  },
  506: {
    ...SERVER_ERROR,
    title: "Response configuration error",
    description: "The server encountered a configuration problem while selecting a response.",
  },
  507: {
    ...SERVER_ERROR,
    title: "Server storage unavailable",
    description: "The server does not currently have enough storage to complete this request.",
  },
  508: {
    ...SERVER_ERROR,
    title: "Processing loop detected",
    description: "The server detected a loop while processing this request.",
  },
  509: {
    ...SERVER_ERROR,
    title: "Bandwidth limit exceeded",
    description: "The service has temporarily exceeded its bandwidth allowance.",
  },
  510: {
    ...SERVER_ERROR,
    title: "Additional request information required",
    description: "The server requires additional request extensions to complete this operation.",
  },
  511: {
    ...SERVER_ERROR,
    icon: ShieldAlert,
    title: "Network authentication required",
    description: "Authenticate with the network before trying this request again.",
  },
}

const APPLICATION_ERROR_CONFIG: Record<ApplicationErrorCode, ErrorConfig> = {
  offline: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "You are offline",
    description: "Reconnect to the internet, then try again.",
  },
  network: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Connection problem",
    description: "The service could not be reached. Check your connection and try again.",
  },
  timeout: {
    ...RETRYABLE_CLIENT_ERROR,
    title: "Request timed out",
    description: "The request took too long to complete. Please try again.",
  },
  unknown: {
    ...SERVER_ERROR,
    title: "Unexpected error",
    description: "An unexpected error occurred. Please try again.",
  },
}

const UNKNOWN_CLIENT_ERROR: ErrorConfig = {
  ...CLIENT_ERROR,
  title: "Request could not be completed",
  description: "The request was rejected. Review the information and try again.",
}

const UNKNOWN_SERVER_ERROR: ErrorConfig = {
  ...SERVER_ERROR,
  title: "Service error",
  description: "The service could not complete the request. Please try again.",
}

const UNKNOWN_ERROR: ErrorConfig = {
  ...SERVER_ERROR,
  title: "Unexpected error",
  description: "An unexpected error occurred. Please try again.",
}

export function getErrorConfig(status: ErrorIdentifier): ErrorConfig {
  if (typeof status === "string") return APPLICATION_ERROR_CONFIG[status]

  const knownConfig = ERROR_CONFIG[status as ErrorCode]

  if (knownConfig) return knownConfig
  if (status >= 400 && status < 500) return UNKNOWN_CLIENT_ERROR
  if (status >= 500 && status < 600) return UNKNOWN_SERVER_ERROR

  return UNKNOWN_ERROR
}

export function getErrorLabel(status: ErrorIdentifier): string {
  if (typeof status === "number") return `HTTP ${status}`

  return status === "offline"
    ? "Offline"
    : status === "network"
      ? "Network"
      : status === "timeout"
        ? "Timeout"
        : "Unknown"
}
