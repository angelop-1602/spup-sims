"use client"

import * as React from "react"
import {
    MsalProvider,
    AuthenticatedTemplate,
    UnauthenticatedTemplate,
    useMsal,
} from "@azure/msal-react"
import { createMsalInstance, loginRequest } from "@/lib/msal"
import { Button } from "@/components/ui/button"

function AuthPageContent() {
    const { instance, accounts } = useMsal()
    const [errorMessage, setErrorMessage] = React.useState<string>("")

    const account = accounts[0]

    const handleLogin = async () => {
        setErrorMessage("")

        try {
            await instance.loginPopup(loginRequest)
        } catch (error) {
            console.error(error)
            setErrorMessage("Sign-in failed. Please try again.")
        }
    }

    const handleLogout = async () => {
        try {
            await instance.logoutPopup({ account })
        } catch (error) {
            console.error(error)
            setErrorMessage("Sign-out failed. Please refresh the page.")
        }
    }
    console.log(
        "NEXT_PUBLIC_AZURE_CLIENT_ID:",
        process.env.NEXT_PUBLIC_AZURE_CLIENT_ID
    )
    return (
        <div className="min-h-svh flex items-center justify-center bg-background px-4 py-10 text-foreground">
            <div className="w-full max-w-4xl rounded-[2rem] border border-border bg-card/95 p-8 shadow-xl shadow-muted/20 backdrop-blur-xl">
                <div className="mb-8 space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Authentication
                    </p>
                    <h1 className="text-3xl font-semibold sm:text-4xl">
                        Sign in with Microsoft
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                        Use your Azure Active Directory account to access the HR management dashboard.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                    <div className="rounded-3xl bg-muted p-6">
                        <h2 className="text-lg font-semibold">How this page works</h2>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            This page uses MSAL React to authenticate users with Azure AD. The token is cached in
                            the browser and can be used to secure the rest of the application.
                        </p>

                        <ul className="mt-5 space-y-2 text-sm text-foreground/80">
                            <li>• Popup sign-in for a streamlined experience</li>
                            <li>• Default requested scope: User.Read</li>
                            <li>• Local storage caching for signed-in sessions</li>
                        </ul>

                        <p className="mt-5 text-xs text-muted-foreground">
                            Configure your Azure AD values in <code className="rounded-md bg-slate-100 px-1 py-0.5 text-xs text-slate-900 dark:bg-slate-950 dark:text-slate-100">.env.local</code>.
                        </p>
                    </div>

                    <div className="rounded-3xl border border-border bg-background p-6">
                        <AuthenticatedTemplate>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Signed in as</p>
                                    <p className="mt-2 text-lg font-semibold">{account?.name ?? account?.username}</p>
                                    <p className="text-sm text-muted-foreground">{account?.username}</p>
                                </div>

                                <Button onClick={handleLogout}>Sign out</Button>

                                {errorMessage ? (
                                    <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                        {errorMessage}
                                    </p>
                                ) : null}
                            </div>
                        </AuthenticatedTemplate>

                        <UnauthenticatedTemplate>
                            <div className="space-y-5">
                                <p className="text-sm text-muted-foreground">
                                    Authenticate with Azure AD to enter the dashboard and access protected functionality.
                                </p>
                                <Button onClick={handleLogin}>Sign in with Microsoft</Button>

                                {errorMessage ? (
                                    <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                        {errorMessage}
                                    </p>
                                ) : null}
                            </div>
                        </UnauthenticatedTemplate>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    const msalInstance = React.useMemo(() => createMsalInstance(), [])

    return (
        <MsalProvider instance={msalInstance}>
            <AuthPageContent />
        </MsalProvider>
    )
}
