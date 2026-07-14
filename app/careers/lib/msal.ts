import { PublicClientApplication } from "@azure/msal-browser"
import { msalConfig } from "@/lib/authConfig"

export { loginRequest } from "@/lib/authConfig"

export function createMsalInstance() {
  return new PublicClientApplication(msalConfig)
}
