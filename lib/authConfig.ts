import type { Configuration, PopupRequest } from "@azure/msal-browser"

const getRedirectUri = () => {
  if (process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI
  }

  if (process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return "http://localhost:3000"
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
    redirectUri: getRedirectUri(),
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
}

export const loginRequest: PopupRequest = {
  scopes: ["User.Read"],
}
