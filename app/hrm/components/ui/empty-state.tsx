import type { LucideIcon } from "lucide-react"
import {
  Inbox,
  SearchX,
  Settings2,
  ShieldAlert,
} from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

export type EmptyStateVariant =
  | "no-records"
  | "no-results"
  | "setup"
  | "permission"

type EmptyStateConfig = {
  title: string
  description: string
  icon: LucideIcon
}

const EMPTY_STATE_CONFIG: Record<EmptyStateVariant, EmptyStateConfig> = {
  "no-records": {
    title: "No records yet",
    description: "Records added to this area will appear here.",
    icon: Inbox,
  },
  "no-results": {
    title: "No matching results",
    description: "Adjust your search or filters and try again.",
    icon: SearchX,
  },
  setup: {
    title: "Setup required",
    description: "Complete the required setup before using this area.",
    icon: Settings2,
  },
  permission: {
    title: "Permission required",
    description: "Ask an administrator for access to this area.",
    icon: ShieldAlert,
  },
}

export type EmptyStateProps = {
  variant?: EmptyStateVariant
  title?: string
  description?: React.ReactNode
  icon?: LucideIcon
  actions?: React.ReactNode
  className?: string
}

export function EmptyState({
  variant = "no-records",
  title,
  description,
  icon: Icon,
  actions,
  className,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[variant]
  const StateIcon = Icon ?? config.icon

  return (
    <Empty role="status" className={cn("min-h-56 border", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon" aria-hidden="true">
          <StateIcon />
        </EmptyMedia>
        <EmptyTitle>{title ?? config.title}</EmptyTitle>
        <EmptyDescription>{description ?? config.description}</EmptyDescription>
      </EmptyHeader>

      {actions ? <EmptyContent>{actions}</EmptyContent> : null}
    </Empty>
  )
}
