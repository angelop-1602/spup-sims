"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type PortfolioSection = {
  id: string
  label: string
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
    <>
      <div className="lg:hidden">
        <Select value={activeSectionId} onValueChange={onSelect}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" side="bottom" avoidCollisions={false}>
            {sections.map((section) => (
              <SelectItem key={section.id} value={section.id}>
                {section.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="hidden rounded-lg lg:block">
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
                    ? "bg-neutral-200 text-foreground dark:bg-neutral-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {section.label}
              </button>
            )
          })}
        </CardContent>
      </Card>
    </>
  )
}
