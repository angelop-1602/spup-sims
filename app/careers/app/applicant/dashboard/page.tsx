"use client"

import Link from "next/link"
import {
  AlertCircle,
  ArrowUpRight,
  CircleDot,
  ClipboardList,
  FileCheck2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const setupSteps = [
  { step: "Account Registration", status: "Completed", value: 100 },
  { step: "Personal & Contact Profile", status: "In Progress", value: 60 },
  { step: "Document Uploads", status: "Pending", value: 20 },
  { step: "Final Application Submission", status: "Locked", value: 0 },
] as const

const checklist = [
  { task: "Upload clear copy of Transcript of Records", scope: "Documents", urgency: "Required" },
  { task: "Complete employment history profile section", scope: "Profile", urgency: "Recommended" },
  { task: "Verify personal contact phone format", scope: "Settings", urgency: "Action Needed" },
] as const

export default function ApplicantDashboardPage() {
  const summaryCards = [
    {
      label: "Application Status",
      value: "Draft",
      detail: "Ready for profile completion",
      icon: ClipboardList,
      colorClass: "bg-amber-700/10 text-amber-700"
    },
    {
      label: "Profile Completion",
      value: "45%",
      detail: "2 of 4 key modules filled",
      icon: CircleDot,
      colorClass: "bg-blue-700/10 text-blue-700"
    },
    {
      label: "Uploaded Documents",
      value: "1 / 4",
      detail: "Mandatory files tracked",
      icon: FileCheck2,
      colorClass: "bg-emerald-700/10 text-emerald-700"
    },
    {
      label: "Action Items",
      value: "3 Pending",
      detail: "Requires your attention",
      icon: AlertCircle,
      colorClass: "bg-rose-700/10 text-rose-700"
    },
  ]

  return (
    <div className="flex min-h-screen w-full bg-muted/30 text-foreground antialiased">
      
        {/* main container limits and controls grid flow */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Header Title Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge variant="outline" className="mb-2 rounded-md px-2 py-0.5 text-[10px] font-medium tracking-wide">
                Candidate Portal
              </Badge>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Welcome back, Applicant
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground max-w-xl">
                Track your submission milestones, update personal data fields, and review onboarding documentation updates.
              </p>
            </div>

            <Button asChild size="sm" className="rounded-xl shadow-sm font-medium shrink-0">
              <Link href="/applicant/profile" className="flex items-center gap-1.5">
                Edit Profile
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          {/* Metric Cards Grid Layout */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.label} className="transition-all hover:shadow-md/5">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardDescription className="text-[10px] font-bold uppercase tracking-wider">{card.label}</CardDescription>
                      <CardTitle className="text-2xl font-bold tracking-tight">
                        {card.value}
                      </CardTitle>
                    </div>
                    <div className={`flex size-9 items-center justify-center rounded-xl shrink-0 ${card.colorClass}`}>
                      <Icon className="size-4.5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[11px] font-medium text-muted-foreground">{card.detail}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Table Data and Completeness Weights Side-by-side */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
            
            {/* Table Checklist */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/40">
                <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Application Pipeline Tracker</CardTitle>
                <CardDescription className="text-xs">Your progress status through verification milestones.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/20">
                      <TableRow className="border-b border-border">
                        <TableHead className="text-[11px] font-bold text-muted-foreground uppercase">Milestone Phase</TableHead>
                        <TableHead className="text-[11px] font-bold text-muted-foreground uppercase w-32">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {setupSteps.map((item) => (
                        <TableRow key={item.step} className="border-b border-border/80 hover:bg-muted/30">
                          <TableCell className="font-semibold text-foreground text-xs py-3">{item.step}</TableCell>
                          <TableCell className="py-3">
                            <Badge 
                              variant="secondary" 
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                                item.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                item.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                item.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 py-3 border-t border-border">
                <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground hover:text-foreground">
                  <Link href="/applicant/profile">Manage Profile Documents</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Weights Indicator */}
            <Card>
              <CardHeader className="border-b border-border bg-muted/40">
                <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Module Completion Weights</CardTitle>
                <CardDescription className="text-xs">Detailed completion metrics per requirement category.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {setupSteps.map((step) => (
                  <div key={step.step} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{step.step}</span>
                      <span className="font-bold text-muted-foreground">{step.value}%</span>
                    </div>
                    <Progress value={step.value} className="h-1.5 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Tasks */}
          <Card>
            <CardHeader className="border-b border-border bg-muted/40">
              <CardTitle className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Outstanding Tasks Required</CardTitle>
              <CardDescription className="text-xs">Actions required before pipeline processing can continue.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                {checklist.map((action) => (
                  <div
                    key={action.task}
                    className="rounded-xl border border-border bg-card p-3.5 flex flex-col justify-between shadow-sm hover:border-foreground/20 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{action.scope}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] rounded-md font-bold px-1.5 py-0.5 ${
                            action.urgency === "Required" ? "text-rose-600 bg-rose-50 border-rose-100" :
                            action.urgency === "Action Needed" ? "text-amber-600 bg-amber-50 border-amber-100" :
                            "text-muted-foreground bg-muted border-border"
                          }`}
                        >
                          {action.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold leading-normal text-foreground">{action.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </main>
      </div>
  )
}