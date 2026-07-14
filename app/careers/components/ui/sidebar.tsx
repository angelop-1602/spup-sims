"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Folder,
  UserCheck,
  FileText,
  Briefcase,
  Sliders,
  ShieldCheck,
  CircleUser,
  Settings,
  LogOut
} from "lucide-react"

interface ApplicantSidebarProps {
  isOpen: boolean
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  groupLabel: string
  items: NavItem[]
}

export default function ApplicantSidebar({ isOpen }: ApplicantSidebarProps) {
  const pathname = usePathname()

  const navigationGroups: NavGroup[] = [
    {
      groupLabel: "Main",
      items: [
        { label: "Dashboard", href: "/applicant", icon: LayoutDashboard },
        { label: "My Portfolio", href: "/applicant/portfolio", icon: Folder },
      ],
    },
    {
      groupLabel: "Application Management",
      items: [
        { label: "Submissions", href: "/applicant/submissions", icon: UserCheck },
        { label: "Documents", href: "/applicant/documents", icon: FileText }      
    ],
    },
    {
      groupLabel: "Settings",
      items: [
        { label: "Preferences", href: "/applicant/preferences", icon: Sliders },
        { label: "Account Security", href: "/applicant/security", icon: ShieldCheck },
        { label: "Profile Details", href: "/applicant/profile", icon: CircleUser },
      ],
    },
  ]

  return (
    <aside
      className={`font-poppins fixed inset-y-0 left-0 z-20 flex flex-col h-screen bg-white transition-all duration-300 ease-in-out font-sans ${
        isOpen ? "w-64 border-r border-neutral-200/60 px-4" : "w-16 border-r border-neutral-200/60 px-2"
      }`}
    >
      {/* Module Branding Header */}
      <div className="flex items-center gap-3 h-20 shrink-0 select-none overflow-hidden border-b border-neutral-100 mb-4 px-2">
        <div className="flex h-10 w-10 aspect-square shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white text-md tracking-wide">          
            HR
        </div>
        {isOpen && (
          <div className="flex flex-col truncate transition-all duration-200">
            <span className="text-sm font-bold text-neutral-900 tracking-tight leading-none mb-1">
              SPUP SIMS
            </span>
            <span className="text-xs font-medium text-neutral-400">
              Applicant Module
            </span>
          </div>
        )}
      </div>

      {/* Structured Nav Groups Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 py-2 no-scrollbar">
        {navigationGroups.map((group) => (
          <div key={group.groupLabel} className="space-y-2">
            {/* Category Title Header */}
            {isOpen ? (
              <p className="text-[11px] font-bold text-neutral-400/90 px-3 uppercase tracking-wider transition-all duration-200">
                {group.groupLabel}
              </p>
            ) : (
              <div className="h-4" /> // Spacing layout buffer when collapsed
            )}

            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl py-2.5 px-3 transition-all duration-150 group text-sm font-medium ${
                      isActive
                        ? "bg-neutral-100 text-neutral-900 font-semibold"
                        : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-5 shrink-0 transition-colors ${
                        isActive ? "text-neutral-900" : "text-neutral-500 group-hover:text-neutral-950"
                      }`}
                    />
                    {isOpen && (
                      <span className="truncate transition-opacity duration-200">
                        {item.label}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* System Configurations Footer Container */}
      <div className="py-4 border-t border-neutral-100 shrink-0 space-y-1 bg-white">
        <Link
          href="/applicant/settings"
          className={`flex items-center gap-3 rounded-xl py-2.5 px-3 transition-all text-sm font-medium ${
            pathname === "/applicant/settings"
              ? "bg-neutral-100 text-neutral-900 font-semibold"
              : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
          }`}
        >
          <Settings className="h-5 w-5 shrink-0 text-neutral-500" />
          {isOpen && <span className="truncate transition-opacity duration-200">System Settings</span>}
        </Link>

        <button
          onClick={() => console.log("Sign Out Action triggered")}
          className="w-full flex items-center gap-3 rounded-xl py-2.5 px-3 text-left text-[13px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50/60 transition-all"
        >
          <LogOut className="h-5 w-5 shrink-0 text-sm text-rose-500" />
          {isOpen && <span className="text-sm truncate transition-opacity duration-200">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}