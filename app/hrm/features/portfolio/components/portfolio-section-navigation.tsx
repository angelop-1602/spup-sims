"use client"

import { Fragment } from "react"

import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type PortfolioNavigationSection = {
  id: string
  label: string
  shortLabel?: string
}

export function PortfolioSectionNavigation({
  sections,
  activeSectionId,
  onNavigate,
}: {
  sections: readonly PortfolioNavigationSection[]
  activeSectionId: string
  onNavigate: (id: string) => void
}) {
  return (
    <nav
      aria-label="Employee portfolio sections"
      className="sticky top-16 z-30 -mx-4 border-y bg-background/95 px-4 backdrop-blur print:hidden md:-mx-5 md:px-5 lg:-mx-6 lg:px-6"
    >
      <div className="overflow-x-auto [scrollbar-width:thin]">
        <div className="flex min-w-max items-center py-2">
          {sections.map((section, index) => {
            const isActive = section.id === activeSectionId

            return (
              <Fragment key={section.id}>
                {index > 0 ? (
                  <Separator
                    orientation="vertical"
                    className="mx-1 h-5 bg-border/70 data-vertical:self-center"
                  />
                ) : null}
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    onNavigate(section.id)
                  }}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {section.shortLabel ?? section.label}
                </a>
              </Fragment>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
