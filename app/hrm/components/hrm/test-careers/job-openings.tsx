"use client"

import { useMemo, useState, type ReactNode } from "react"
import { BriefcaseBusiness, CalendarDays, MapPin, Search, SlidersHorizontal } from "lucide-react"

import type { Job } from "@/components/hrm/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ALL = "all"

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(date)
}

function JobDialog({ job, onClose }: { job: Job | null; onClose: () => void }) {
  return (
    <Dialog open={Boolean(job)} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-[#dce3de] sm:max-w-2xl">
        {job ? <>
          <DialogHeader className="pr-6 text-left"><p className="text-xs font-semibold uppercase tracking-widest text-[#167654]">{job.department}</p><DialogTitle className="font-serif text-2xl leading-tight text-[#063d29] sm:text-3xl">{job.title}</DialogTitle><DialogDescription>{job.location} · {job.type} · {job.workplace}</DialogDescription></DialogHeader>
          <div className="space-y-7 text-sm leading-7 text-[#4f5e55]">
            <section><h3 className="mb-2 font-semibold text-[#18211c]">About the role</h3><p>{job.description}</p></section>
            <section><h3 className="mb-2 font-semibold text-[#18211c]">Key responsibilities</h3><ul className="list-disc space-y-2 pl-5">{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <section><h3 className="mb-2 font-semibold text-[#18211c]">Candidate qualifications</h3><ul className="list-disc space-y-2 pl-5">{job.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section>
            {/* Prototype benefit copy comes from shared sample data and requires HR verification before production. */}
            <section><h3 className="mb-2 font-semibold text-[#18211c]">Sample benefits information</h3><p className="mb-3 text-xs text-[#66716a]">Benefits shown in this prototype must be confirmed by SPUP Human Resources.</p><ul className="list-disc space-y-2 pl-5">{job.benefits.map((item) => <li key={item}>{item}</li>)}</ul></section>
            <div className="rounded-lg border border-[#d8c48f] bg-[#faf4e3] p-4"><strong className="text-[#5d4617]">Application deadline:</strong> {formatDate(job.deadline)}</div>
          </div>
        </> : null}
      </DialogContent>
    </Dialog>
  )
}

export function JobOpenings({ jobs, hero }: { jobs: Job[]; hero: ReactNode }) {
  const [query, setQuery] = useState("")
  const [department, setDepartment] = useState(ALL)
  const [workplace, setWorkplace] = useState(ALL)
  const [selected, setSelected] = useState<Job | null>(null)
  const departments = useMemo(() => [...new Set(jobs.map((job) => job.department))].sort(), [jobs])
  const workplaces = useMemo(() => [...new Set(jobs.map((job) => job.workplace))].sort(), [jobs])
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return jobs.filter((job) => {
      const text = [job.title, job.department, job.description, ...job.requirements].join(" ").toLowerCase()
      return (!needle || text.includes(needle)) && (department === ALL || job.department === department) && (workplace === ALL || job.workplace === workplace)
    })
  }, [department, jobs, query, workplace])
  const hasFilters = Boolean(query.trim()) || department !== ALL || workplace !== ALL
  const clear = () => { setQuery(""); setDepartment(ALL); setWorkplace(ALL) }

  return (
    <>
      <section className="flex min-h-[calc(100svh-8rem)] flex-col border-b border-[#dce3de] bg-[#faf8f1]">
        {hero}
        <div className="mx-auto w-full max-w-7xl px-5 pb-7 sm:px-8 sm:pb-8 lg:px-12 lg:pb-9">
          <div className="rounded-xl border border-[#cfdad3] bg-white p-5 shadow-[0_14px_36px_rgba(6,61,41,0.09)] sm:p-6 lg:p-7">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr]">
            <div className="grid gap-2"><Label htmlFor="job-keyword" className="text-sm font-medium text-[#36443c]">Search</Label><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#66716a]" aria-hidden="true" /><Input id="job-keyword" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Position, department, or qualification" className="min-h-12 border-[#b9c8bf] bg-white pl-10 text-[#18211c] placeholder:text-[#7b877f] focus-visible:border-[#167654]" /></div></div>
            <div className="grid gap-2"><Label htmlFor="job-department" className="text-sm font-medium text-[#36443c]">Department</Label><Select value={department} onValueChange={setDepartment}><SelectTrigger id="job-department" className="min-h-12 w-full border-[#b9c8bf] bg-white text-[#18211c] focus-visible:border-[#167654]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All departments</SelectItem>{departments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-2 md:col-span-2 lg:col-span-1"><Label htmlFor="job-workplace" className="text-sm font-medium text-[#36443c]">Workplace</Label><Select value={workplace} onValueChange={setWorkplace}><SelectTrigger id="job-workplace" className="min-h-12 w-full border-[#b9c8bf] bg-white text-[#18211c] focus-visible:border-[#167654]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value={ALL}>All arrangements</SelectItem>{workplaces.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          </div>
        </div>
        </div>
      </section>
      <section className="bg-white py-12 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <header id="openings" className="mb-7 max-w-2xl scroll-mt-28"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#167654]">Current opportunities</p><h2 className="mt-2 font-serif text-3xl font-semibold text-[#063d29] sm:text-4xl">Find your place at SPUP</h2><p className="mt-2 text-sm font-medium text-[#536159]" role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "opening" : "openings"} found</p></header>
        {filtered.length ? (
          <div className="divide-y divide-[#dce3de] border-y border-[#dce3de]">
            {filtered.map((job) => (
              <article
                key={job.id}
                className="grid min-w-0 gap-5 py-7 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10 lg:py-8"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#167654]">
                    {job.department}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl font-semibold leading-snug text-[#063d29] sm:text-3xl">
                    {job.title}
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#66716a]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" aria-hidden="true" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BriefcaseBusiness className="size-4" aria-hidden="true" />
                      {job.type}
                    </span>
                  </div>
                  <p className="mt-4 max-w-3xl leading-7 text-[#536159]">{job.description}</p>
                </div>
                <div className="flex flex-col items-start border-[#dce3de] lg:border-l lg:pl-8">
                  <div className="flex flex-wrap gap-2">
                    {[job.workplace, job.experienceLevel].map((item) => (
                      <span key={item} className="rounded-full border border-[#cdd8d1] bg-[#fffefa] px-3 py-1 text-xs font-medium text-[#445249]">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-[#66716a]">
                    <span>
                      <CalendarDays className="mr-1.5 inline size-4" aria-hidden="true" />
                      Posted {formatDate(job.postedDate)}
                    </span>
                    <span>Closes {formatDate(job.deadline)}</span>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setSelected(job)}
                    variant="outline"
                    className="mt-5 min-h-11 border-[#9db7a7] bg-white text-[#07543a] hover:bg-[#e7f1eb]"
                  >
                    View position <span aria-hidden="true">→</span>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="rounded-xl border border-dashed border-[#b9c8bf] bg-[#faf8f1] px-5 py-14 text-center"><Search className="mx-auto size-8 text-[#167654]" aria-hidden="true" /><h3 className="mt-4 font-serif text-2xl font-semibold text-[#063d29]">No openings match your search</h3><p className="mx-auto mt-2 max-w-md text-[#66716a]">Try using a broader keyword or removing one or more filters.</p><Button type="button" onClick={clear} className="mt-6 min-h-11 bg-[#07543a] text-white">Clear filters and view all openings</Button></div>}
      </div>
      </section>
      <JobDialog job={selected} onClose={() => setSelected(null)} />
    </>
  )
}
