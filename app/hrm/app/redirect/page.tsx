"use client"

import * as React from "react"
import { broadcastResponseToMainFrame } from "@azure/msal-browser/redirect-bridge"

export default function RedirectPage() {
  React.useEffect(() => {
    broadcastResponseToMainFrame().catch((error) => {
      console.error("Error broadcasting MSAL response:", error)
    })
  }, [])

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 text-sm text-muted-foreground">
      Processing authentication...
    </main>
  )
}
