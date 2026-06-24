"use client"

import * as React from "react"
import { MsalProvider } from "@azure/msal-react"

import { createMsalInstance } from "@/lib/msal"

export function Providers({ children }: { children: React.ReactNode }) {
  const [msalInstance] = React.useState(() => createMsalInstance())

  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>
}
