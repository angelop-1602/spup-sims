import {
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock3,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger"

const STATUS_TONES = {
  neutral: { variant: "outline", icon: CircleDot },
  info: { variant: "info", icon: CalendarClock },
  success: { variant: "success", icon: CheckCircle2 },
  warning: { variant: "warning", icon: Clock3 },
  danger: { variant: "destructive", icon: XCircle },
} as const

type StatusBadgeProps = {
  tone?: StatusTone
  children: React.ReactNode
  className?: string
}

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: StatusBadgeProps) {
  const { variant, icon: Icon } = STATUS_TONES[tone]

  return (
    <Badge
      variant={variant}
      className={cn("h-6 gap-1 px-2.5 text-xs [&>svg]:size-3!", className)}
    >
      <Icon aria-hidden="true" />
      {children}
    </Badge>
  )
}
