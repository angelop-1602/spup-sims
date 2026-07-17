"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getHrmBreadcrumbs, type HrmBreadcrumbItem } from "./hrm-navigation"

function BreadcrumbEntry({ item, isCurrent }: { item: HrmBreadcrumbItem; isCurrent: boolean }) {
  if (isCurrent) return <BreadcrumbPage>{item.label}</BreadcrumbPage>
  if (!item.href) return <span>{item.label}</span>

  return (
    <BreadcrumbLink asChild>
      <Link href={item.href}>{item.label}</Link>
    </BreadcrumbLink>
  )
}

export function AppBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname()
  const items = getHrmBreadcrumbs(pathname)
  const currentItem = items.at(-1)
  const ancestors = items.slice(0, -1)

  return (
    <div className={cn("min-w-0", className)}>
      <Breadcrumb className="hidden lg:block">
        <BreadcrumbList className="flex-nowrap">
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1
            return (
              <React.Fragment key={`${item.label}-${index}`}>
                <BreadcrumbItem className="min-w-0">
                  <BreadcrumbEntry item={item} isCurrent={isCurrent} />
                </BreadcrumbItem>
                {isCurrent ? null : <BreadcrumbSeparator />}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <Breadcrumb className="lg:hidden">
        <BreadcrumbList className="flex-nowrap">
          {ancestors.length > 0 ? (
            <>
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    aria-label="Show parent pages"
                  >
                    <BreadcrumbEllipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {ancestors.map((item, index) =>
                      item.href ? (
                        <DropdownMenuItem key={`${item.label}-${index}`} asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem key={`${item.label}-${index}`} disabled>
                          {item.label}
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          {currentItem ? (
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage>{currentItem.label}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
