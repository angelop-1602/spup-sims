import type {
  Configuration,
  RedirectRequest,
} from "@azure/msal-browser"

function getBrowserOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return "http://localhost:3000"
}

const getRedirectUri = () => {
  const configuredRedirectUri =
    process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ??
    process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI

  if (configuredRedirectUri) {
    if (configuredRedirectUri.startsWith("/")) {
      return `${getBrowserOrigin()}${configuredRedirectUri}`
    }

    return configuredRedirectUri
  }

  return getBrowserOrigin()
}

const getModulePortalUri = () => {
  try {
    return new URL("/", getRedirectUri()).origin
  } catch {
    return getBrowserOrigin()
  }
}

function getLoginScopes() {
  const configuredScopes = process.env.NEXT_PUBLIC_API_SCOPES?.split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter(Boolean)

  return configuredScopes?.length ? configuredScopes : ["User.Read"]
}

export const msalConfig: Configuration = {
  auth: {
    clientId:
      process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ??
      process.env.NEXT_PUBLIC_CLIENT_ID ??
      "",
    authority: `https://login.microsoftonline.com/${
      process.env.NEXT_PUBLIC_AZURE_TENANT_ID ??
      process.env.NEXT_PUBLIC_TENANT_ID ??
      "common"
    }`,
    postLogoutRedirectUri: getModulePortalUri(),
    redirectUri: getRedirectUri(),
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
}

export const loginRequest: RedirectRequest = {
  prompt: "select_account",
  redirectUri: getRedirectUri(),
  scopes: getLoginScopes(),
}

export const modulePortalUri = getModulePortalUri()
