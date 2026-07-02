"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type PortfolioSection = {
  id: string
  label: string
  columns: string[]
  rows: (string | number)[][]
}

type PortfolioSectionNavProps = {
  sections: PortfolioSection[]
  activeSectionId: string
  onSelect: (id: string) => void
}

export function PortfolioSectionNav({
  sections,
  activeSectionId,
  onSelect,
}: PortfolioSectionNavProps) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex flex-col gap-1">
        {sections.map((section) => {
          const isActive = section.id === activeSectionId
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={cn(
                "w-full whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "bg-neutral-200 font-semibold text-foreground dark:bg-neutral-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {section.label}
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
