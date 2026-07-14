"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  ClipboardList,
  FileCheck2,
  AlertCircle,
  CircleDot,
  Menu
} from "lucide-react"

import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { Progress } from "../../../components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table"

// Import custom collapsible sidebar
import ApplicantSidebar from "../../../components/ui/sidebar"

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
  const [sidebarOpen, setSidebarOpen] = useState(true)

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
    <div className="flex min-h-screen w-full bg-neutral-50/60 text-neutral-900 antialiased selection:bg-neutral-950/5">
      
      {/* 1. Self-contained Custom Sidebar */}
      <ApplicantSidebar isOpen={sidebarOpen} />

      {/* 2. Transition-Aware Main Workspace */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "pl-64" : "pl-16"
        }`}
      >
        
        {/* Top Header Navigation Panel */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-neutral-200/50 bg-white/80 px-4 backdrop-blur-md md:px-6 shrink-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-xl border border-neutral-200 p-2 hover:bg-neutral-50 transition-colors focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-4 w-4 text-neutral-600" />
          </button>
          <div className="h-4 w-px bg-neutral-200" />
          <span className="text-xs font-semibold text-neutral-400">Application Workspace</span>
        </header>

        {/* main container limits and controls grid flow */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Header Title Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Badge variant="outline" className="mb-2 rounded-md border-neutral-200 text-neutral-600 px-2 py-0.5 text-[10px] font-medium tracking-wide">
                Candidate Portal
              </Badge>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                Welcome back, Applicant
              </h1>
              <p className="mt-0.5 text-xs text-neutral-500 max-w-xl">
                Track your submission milestones, update personal data fields, and review onboarding documentation updates.
              </p>
            </div>

            <Button asChild size="sm" className="rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white shadow-sm font-medium shrink-0">
              <Link href="/applicant/profile" className="flex items-center gap-1.5">
                Complete Profile
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          {/* Metric Cards Grid Layout */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon
              return (
                <Card key={card.label} className="rounded-2xl border-neutral-200/60 bg-white shadow-sm transition-all hover:shadow-md/5">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardDescription className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{card.label}</CardDescription>
                      <CardTitle className="text-2xl font-bold tracking-tight text-neutral-950">
                        {card.value}
                      </CardTitle>
                    </div>
                    <div className={`flex size-9 items-center justify-center rounded-xl shrink-0 ${card.colorClass}`}>
                      <Icon className="size-4.5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[11px] font-medium text-neutral-400">{card.detail}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Table Data and Completeness Weights Side-by-side */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
            
            {/* Table Checklist */}
            <Card className="rounded-2xl border-neutral-200/60 bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-neutral-100 bg-neutral-50/40">
                <CardTitle className="text-xs font-bold tracking-wide uppercase text-neutral-400">Application Pipeline Tracker</CardTitle>
                <CardDescription className="text-xs">Your progress status through verification milestones.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-neutral-50/20">
                      <TableRow className="border-b border-neutral-100">
                        <TableHead className="text-[11px] font-bold text-neutral-400 uppercase">Milestone Phase</TableHead>
                        <TableHead className="text-[11px] font-bold text-neutral-400 uppercase w-32">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {setupSteps.map((item) => (
                        <TableRow key={item.step} className="border-b border-neutral-100/80 hover:bg-neutral-50/30">
                          <TableCell className="font-semibold text-neutral-800 text-xs py-3">{item.step}</TableCell>
                          <TableCell className="py-3">
                            <Badge 
                              variant="secondary" 
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                                item.status === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                item.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                item.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                "bg-neutral-100 text-neutral-400 border-neutral-200/40"
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
              <CardFooter className="bg-neutral-50/30 py-3 border-t border-neutral-100">
                <Button asChild variant="ghost" size="sm" className="text-xs font-bold text-neutral-600 hover:text-neutral-950">
                  <Link href="/applicant/profile">Manage Profile Documents</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Weights Indicator */}
            <Card className="rounded-2xl border-neutral-200/60 bg-white shadow-sm">
              <CardHeader className="border-b border-neutral-100 bg-neutral-50/40">
                <CardTitle className="text-xs font-bold tracking-wide uppercase text-neutral-400">Module Completion Weights</CardTitle>
                <CardDescription className="text-xs">Detailed completion metrics per requirement category.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {setupSteps.map((step) => (
                  <div key={step.step} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700">{step.step}</span>
                      <span className="font-bold text-neutral-500">{step.value}%</span>
                    </div>
                    <Progress value={step.value} className="h-1.5 rounded-full bg-neutral-100" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Tasks */}
          <Card className="rounded-2xl border-neutral-200/60 bg-white shadow-sm">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/40">
              <CardTitle className="text-xs font-bold tracking-wide uppercase text-neutral-400">Outstanding Tasks Required</CardTitle>
              <CardDescription className="text-xs">Actions required before pipeline processing can continue.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                {checklist.map((action) => (
                  <div
                    key={action.task}
                    className="rounded-xl border border-neutral-200/60 bg-white p-3.5 flex flex-col justify-between shadow-sm hover:border-neutral-300 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{action.scope}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] rounded-md font-bold px-1.5 py-0.5 ${
                            action.urgency === "Required" ? "text-rose-600 bg-rose-50 border-rose-100" :
                            action.urgency === "Action Needed" ? "text-amber-600 bg-amber-50 border-amber-100" :
                            "text-neutral-600 bg-neutral-50 border-neutral-200"
                          }`}
                        >
                          {action.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold leading-normal text-neutral-700">{action.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </main>
      </div>
    </div>
  )
}