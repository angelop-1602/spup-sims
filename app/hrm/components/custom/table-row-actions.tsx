"use client"

import { Fragment, type ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type TableRowAction = {
  label: string
  icon: ReactNode
  onSelect: () => void | Promise<void>
  disabled?: boolean
  variant?: "default" | "destructive"
}

export function TableRowActions({
  actions,
  label = "Row actions",
}: {
  actions: readonly TableRowAction[]
  label?: string
}) {
  if (actions.length === 0) return null

  if (actions.length <= 3) {
    return (
      <TooltipProvider>
        <div
          className="flex items-center justify-end gap-1"
          role="group"
          aria-label={label}
        >
          {actions.map((action) => (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    action.variant === "destructive" ? "destructive" : "outline"
                  }
                  size="icon-sm"
                  onClick={action.onSelect}
                  disabled={action.disabled}
                  aria-label={action.label}
                >
                  {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{action.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    )
  }

  const firstDestructiveIndex = actions.findIndex(
    (action) => action.variant === "destructive",
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={label}
        >
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {actions.map((action, index) => (
          <Fragment key={action.label}>
            {index === firstDestructiveIndex && index > 0 ? (
              <DropdownMenuSeparator />
            ) : null}
            <DropdownMenuItem
              variant={action.variant}
              disabled={action.disabled}
              onSelect={action.onSelect}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
