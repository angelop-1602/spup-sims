"use client"

import * as React from "react"
import { FileText, Loader2, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useApiQuery, type components } from "@/lib/api"

type PagedEducationCredentials =
  components["schemas"]["PagedResponseOfEducationCredentialResponse"]

export function EducationCredentialsCell({
  profileId,
  educationalBackgroundId,
}: {
  profileId: number | string
  educationalBackgroundId: number | string
}) {
  const [open, setOpen] = React.useState(false)

  const { data, loading } = useApiQuery<PagedEducationCredentials>(
    `/api/v1/hrms/profiles/${profileId}/education-credentials/${educationalBackgroundId}`,
    undefined,
    { enabled: open },
  )
  const credential = data?.data?.[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Paperclip className="h-3.5 w-3.5" />
          Files
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading files…
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <CredentialLink label="Diploma" href={credential?.diploma} />
            <CredentialLink
              label="Transcript of Records"
              href={credential?.transcriptOfRecords}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function CredentialLink({
  label,
  href,
}: {
  label: string
  href?: string | null
}) {
  if (!href) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-3.5 w-3.5 opacity-50" />
        {label} — not uploaded
      </p>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-foreground hover:underline"
    >
      <FileText className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}
