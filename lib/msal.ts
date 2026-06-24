import { PublicClientApplication, type Configuration } from "@azure/msal-browser"

const getRedirectUri = () => {
  if (typeof window === "undefined") {
    return ""
  }

  return (
    process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ??
    `${window.location.origin}/auth`
  )
}

const msalConfig: Configuration = {
  auth: {
    clientId:
      process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ??
      process.env.NEXT_PUBLIC_CLIENT_ID ??
      "",
    authority:
      process.env.NEXT_PUBLIC_AZURE_AUTHORITY ??
      `https://login.microsoftonline.com/${
        process.env.NEXT_PUBLIC_AZURE_TENANT_ID ??
        process.env.NEXT_PUBLIC_TENANT_ID ??
        "common"
      }`,
    redirectUri:
      process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ??
      process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI ??
      getRedirectUri(),
  },
  cache: {
    cacheLocation: "localStorage",
  },
}

export const loginRequest = {
  scopes: ["User.Read"],
}

export function createMsalInstance() {
  return new PublicClientApplication(msalConfig)
}
