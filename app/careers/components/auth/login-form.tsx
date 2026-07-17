"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import type { components } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { z } from 'zod';

type LoginRequest = components["schemas"]["ApplicantLoginRequest"]

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address."),
})

const loginSchema = z.object({
  // Adjusted to use correct Zod email validator syntax
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<{
    email?: string
    password?: string
  }>({})
  const [submitting, setSubmitting] = React.useState(false)

  const [forgotOpen, setForgotOpen] = React.useState(false)
  const [forgotEmail, setForgotEmail] = React.useState("")
  const [forgotError, setForgotError] = React.useState<string | null>(null)
  const [forgotMessage, setForgotMessage] = React.useState<string | null>(null)
  const [forgotSubmitting, setForgotSubmitting] = React.useState(false)

  function openForgotPassword() {
    setForgotEmail("")
    setForgotError(null)
    setForgotMessage(null)
    setForgotOpen(true)
  }

  async function handleForgotPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setForgotError(null)

    const result = forgotPasswordSchema.safeParse({ email: forgotEmail })
    if (!result.success) {
      setForgotError(z.flattenError(result.error).fieldErrors.email?.[0] ?? "Enter a valid email address.")
      return
    }

    setForgotSubmitting(true)
    try {
      const response = await fetch("/api/v1/applicant/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      })
      const data = await response.json().catch(() => null)
      setForgotMessage(data?.message || "If the email exists, a password reset link has been sent.")
    } catch {
      setForgotError("An unexpected network error occurred.")
    } finally {
      setForgotSubmitting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const flat = z.flattenError(result.error).fieldErrors
      setFieldErrors({
        email: flat.email?.[0],
        password: flat.password?.[0],
      })
      return
    }
    setFieldErrors({})

    setSubmitting(true)
    try {
      const body: LoginRequest = { email, password }
      const response = await fetch("/api/v1/applicant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const problem = await response.json().catch(() => null)
        setError(problem?.detail || problem?.title || "Login failed.")
        return
      }

      const data = await response.json()

      if (data.accessToken) {
        localStorage.setItem("access_token", data.accessToken)
      }

      const returnTo = searchParams.get("returnTo")
      const safeReturnTo =
        returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") && !returnTo.startsWith("/\\")
          ? returnTo
          : "/applicant/dashboard"
      router.push(safeReturnTo)
      router.refresh()
    } catch (err) {
      setError("An unexpected network error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Enter your email and password to login.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <CardContent className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ict@spup.edu.ph"
                required
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </label>
                <FieldDescription>
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-foreground hover:underline hover:underline-offset-4 hover:text-primary"
                  >
                    Forgot your password?
                  </button>
                </FieldDescription>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>

          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </Button>
            <FieldDescription className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account? <Link href="/register" className="text-foreground no-underline! hover:underline!">
                Register
              </Link>
            </FieldDescription>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={(next) => !forgotSubmitting && setForgotOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email and we&apos;ll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>

          {forgotMessage ? (
            <p className="text-sm text-foreground">{forgotMessage}</p>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="ict@spup.edu.ph"
                  required
                />
                {forgotError && (
                  <p className="mt-1 text-sm text-destructive">{forgotError}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={forgotSubmitting}>
                  {forgotSubmitting ? "Sending..." : "Send reset link"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}