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
  FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { z } from 'zod';

type LoginRequest = components["schemas"]["ApplicantLoginRequest"]

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
                  <Link href="#" className="text-foreground no-underline! hover:underline!">
                    Forgot your password?
                  </Link>
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
    </div>
  )
}