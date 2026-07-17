"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const links = [
  ["Home", "#main-content"],
  ["Job Openings", "#openings"],
  ["Why SPUP", "#why-spup"],
  ["Application Process", "#application-process"],
  ["FAQs", "#faqs"],
] as const

const signInHref = "/login?returnTo=%2Ftest-careers"

export function CareersHeader() {
  return (
    <>
      <div className="bg-[#063d29] text-white">
        <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-4 px-5 py-2 text-xs sm:px-8 lg:px-12">
          <span className="font-medium tracking-wide">Official Recruitment Portal</span>
          <a href="https://spup.edu.ph/" target="_blank" rel="noreferrer" className="hidden min-h-8 items-center text-white/80 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e9cf88] sm:flex">Visit the SPUP website</a>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-[#dce3de] bg-[#fffefa]/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
          <a href="#main-content" className="flex min-w-0 items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167654] focus-visible:ring-offset-4">
            <Image src="/SPUP-final-logo.png" alt="St. Paul University Philippines" width={52} height={52} className="h-12 w-12 shrink-0 object-contain" priority />
            <span className="min-w-0 leading-tight">
              <span className="block font-serif text-lg font-semibold text-[#063d29]">SPUP Careers</span>
              <span className="hidden text-xs text-[#66716a] sm:block">St. Paul University Philippines</span>
            </span>
          </a>
          <nav aria-label="Primary navigation" className="hidden items-center gap-1 xl:flex">
            {links.map(([label, href]) => <a key={href} href={href} className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-[#36443c] hover:bg-[#e7f1eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167654]">{label}</a>)}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="outline" className="min-h-11 border-[#b9c8bf]"><Link href={signInHref}>Applicant sign in</Link></Button>
            <Button asChild className="min-h-11 bg-[#07543a] text-white hover:bg-[#063d29]"><Link href={signInHref}>Create profile</Link></Button>
          </div>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="icon" className="size-11 border-[#b9c8bf] md:hidden" aria-label="Open navigation"><Menu aria-hidden="true" /></Button></SheetTrigger>
            <SheetContent className="w-[min(88vw,24rem)] border-[#dce3de] bg-[#fffefa] p-6">
              <SheetHeader className="text-left"><SheetTitle className="font-serif text-2xl text-[#063d29]">SPUP Careers</SheetTitle><SheetDescription>Recruitment portal navigation</SheetDescription></SheetHeader>
              <nav aria-label="Mobile navigation" className="mt-8 flex flex-col gap-1">
                {links.map(([label, href]) => <SheetClose key={href} asChild><a href={href} className="flex min-h-12 items-center rounded-md px-3 font-medium hover:bg-[#e7f1eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167654]">{label}</a></SheetClose>)}
              </nav>
              <div className="mt-8 grid gap-3 border-t border-[#dce3de] pt-6">
                <Button asChild variant="outline" className="min-h-12"><Link href={signInHref}>Applicant sign in</Link></Button>
                <Button asChild className="min-h-12 bg-[#07543a] text-white"><Link href={signInHref}>Create applicant profile</Link></Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  )
}
