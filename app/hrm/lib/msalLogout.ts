import type {
  AccountInfo,
  IPublicClientApplication,
} from "@azure/msal-browser"

import { modulePortalUri } from "@/lib/authConfig"
import { clearCachedHrmAccess } from "@/lib/hrmAccess"

export async function signOutCurrentAccount(
  instance: IPublicClientApplication,
  account?: AccountInfo | null,
) {
  clearCachedHrmAccess()

  const accountToClear = instance.getActiveAccount() ?? account

  if (accountToClear) {
    await instance.clearCache({ account: accountToClear })
  } else {
    await instance.clearCache()
  }

  instance.setActiveAccount(null)
  window.location.replace(modulePortalUri)
}
