import Link from "next/link"
import { ArrowRight, LayoutGrid, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const modules = [
  {
    title: "Human Resource Management",
    code: "HRM",
    description:
      "Employee records, applicants, attendance, and personnel workflows.",
    href: "/hrm/dashboard",
    status: "Available",
    icon: Users,
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-700 text-sm font-semibold text-white">
              SP
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">SPUP HRM</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Human Resource Management
              </p>
            </div>
          </div>

          <Badge variant="outline" className="h-7 rounded-md px-3">
            {modules.length} available
          </Badge>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="max-w-xl">
            <Badge variant="secondary" className="mb-4 rounded-md px-3">
              HRM Portal
            </Badge>
            <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
              SPUP Human Resource Management
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Continue to the Human Resource Management workspace for employee
              records, applicants, and personnel workflows.
            </p>
          </div>

          <div className="w-full">
            <div className="mb-4 flex items-center gap-2">
              <LayoutGrid className="size-5 text-emerald-700" />
              <h2 className="text-lg font-semibold">Modules</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {modules.map((module) => {
                const Icon = module.icon

                return (
                  <Card
                    key={module.code}
                    className="rounded-lg border border-border/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <CardHeader className="gap-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-700/10 text-emerald-700">
                          <Icon className="size-5" />
                        </div>
                        <Badge variant="secondary" className="rounded-md">
                          {module.status}
                        </Badge>
                      </div>

                      <div>
                        <CardTitle className="text-xl">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="mt-2 leading-6">
                          {module.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardFooter>
                      <Button asChild className="w-full justify-between">
                        <Link href={module.href}>
                          Open {module.code}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
