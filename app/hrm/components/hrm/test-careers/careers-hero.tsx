import { ArrowDown, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CareersHero() {
  return (
    <div className="flex flex-1 items-center">
      <div className="mx-auto w-full max-w-5xl px-5 py-8 text-center sm:px-8 sm:py-10 lg:px-12 lg:py-8">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#07543a] sm:text-sm">Careers at St. Paul University Philippines</p>
          <h1 className="font-serif text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-[#063d29]">Build a meaningful career in a community of excellence and service.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#536159] sm:text-lg">Explore opportunities in teaching, administration, healthcare, research, technology, and university support.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="min-h-12 bg-[#07543a] px-6 text-white hover:bg-[#063d29]"><a href="#openings">Explore job openings <ArrowDown aria-hidden="true" /></a></Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 border-[#9eada4] bg-transparent px-6"><a href="#application-process">View application process <ArrowRight aria-hidden="true" /></a></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
