"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Briefcase,
  ArrowUpRight,
  Search,
  SearchX,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Instrument_Serif, Poppins, Epilogue } from "next/font/google";
import {
  Job,
  JobPostingsApiResponse,
  mapApiJobToJob,
} from "@/components/landing/types";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const epilogue = Epilogue({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function SkeletonCard() {
  return (
    <div className="bg-white border-2 border-neutral-200 rounded-xl flex flex-col justify-between relative overflow-hidden animate-pulse">
      <div className="bg-neutral-200 px-5 py-4 border-b-2 border-neutral-200 rounded-t-[10px]">
        <div className="h-4 bg-neutral-300 rounded w-3/4 mb-2" />
        <div className="h-2.5 bg-neutral-300 rounded w-1/2" />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between bg-white rounded-b-[10px]">
        <div>
          <div className="flex gap-2 mb-3">
            <div className="h-5 bg-neutral-100 rounded w-16 border border-neutral-200" />
            <div className="h-5 bg-neutral-100 rounded w-20 border border-neutral-200" />
            <div className="h-5 bg-neutral-100 rounded w-18 border border-neutral-200" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2.5 bg-neutral-100 rounded w-full" />
            <div className="h-2.5 bg-neutral-100 rounded w-full" />
            <div className="h-2.5 bg-neutral-100 rounded w-2/3" />
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="h-2.5 bg-neutral-100 rounded w-20" />
          <div className="h-3 bg-neutral-100 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export default function JobOpeningsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedWorkplace, setSelectedWorkplace] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const res = await fetch("/api/v1/applicant/job-postings");
        if (!res.ok) throw new Error("Failed to fetch");
        const json: JobPostingsApiResponse = await res.json();
        if (json.success && json.data?.data) {
          setJobs(json.data.data.map(mapApiJobToJob));
        }
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const departments = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.department)))],
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        selectedDepartment === "All" || job.department === selectedDepartment;
      const matchesWorkplace =
        selectedWorkplace === "All" || job.workplace === selectedWorkplace;
      const matchesExperience =
        selectedExperience === "All" ||
        job.experienceLevel === selectedExperience;
      return matchesSearch && matchesDept && matchesWorkplace && matchesExperience;
    });
  }, [
    jobs,
    searchQuery,
    selectedDepartment,
    selectedWorkplace,
    selectedExperience,
  ]);

  const hasActiveFilters =
    searchQuery ||
    selectedDepartment !== "All" ||
    selectedWorkplace !== "All" ||
    selectedExperience !== "All";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("All");
    setSelectedWorkplace("All");
    setSelectedExperience("All");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col antialiased selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 flex items-center justify-center">
                <img
                  src="/SPUP-final-logo.png"
                  alt="SPUP Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left flex flex-col justify-center">
                <h1 className="font-poppins text-sm font-extrabold text-neutral-900 tracking-tight leading-none uppercase">
                  SPUP HRM Careers
                </h1>
                <span className="font-epilogue text-[10px] font-bold text-neutral-400 mt-1 leading-none">
                  St. Paul University Philippines
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-6 ml-auto font-epilogue">
              <Link
                href="/"
                className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/job-openings"
                className="text-[11px] font-semibold text-neutral-900 transition-colors"
              >
                Job Openings
              </Link>
              <a
                href="/register"
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer shadow-sm"
              >
                Login / Register
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Page Title Section */}
        <section className="relative w-full overflow-hidden bg-white border-b border-neutral-200">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)]" />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -right-16 w-80 h-80 bg-emerald-200/35 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-2 right-2 sm:top-6 sm:right-6 w-28 h-28 sm:w-40 sm:h-40 bg-amber-200/40 rounded-full blur-2xl sm:blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="max-w-2xl">
              <h2
                className={`${instrumentSerif.className} text-3xl sm:text-4xl lg:text-5xl font-normal text-emerald-800 tracking-wide leading-tight [-webkit-text-stroke:1px_#065f46] sm:[-webkit-text-stroke:1.5px_#065f46] [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]`}
              >
                All Job Openings
              </h2>
              <p
                className={`${epilogue.className} text-sm text-neutral-700 mt-2`}
              >
                Browse positions currently accepting applications at SPUP.
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filters */}
        <section className="bg-white border-b border-neutral-100 sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, department, or keyword..."
                  className={`${epilogue.className} w-full pl-10 pr-4 py-2.5 text-xs text-black bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Dropdowns */}
              <div className="flex gap-2 items-center">
                <SlidersHorizontal className="w-4 h-4 text-neutral-400 hidden md:block" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={`${epilogue.className} text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer`}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "All Departments" : d}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedWorkplace}
                  onChange={(e) => setSelectedWorkplace(e.target.value)}
                  className={`${epilogue.className} text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer`}
                >
                  <option value="All">All Workplace</option>
                  <option value="Onsite">Onsite</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className={`${epilogue.className} text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-neutral-900 transition-colors cursor-pointer`}
                >
                  <option value="All">All Levels</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                </select>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className={`${epilogue.className} text-[10px] font-bold text-neutral-500 hover:text-neutral-900 uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer`}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results count */}
          {!loading && (
            <p
              className={`${epilogue.className} text-xs text-neutral-400 mb-6 font-medium`}
            >
              {filteredJobs.length === 0
                ? "No positions found"
                : `${filteredJobs.length} position${filteredJobs.length !== 1 ? "s" : ""} available`}
            </p>
          )}

          {/* Job Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/job-openings/${job.id}`}
                  className="group bg-white border-2 border-emerald-950 rounded-xl flex flex-col justify-between relative overflow-visible [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#facc15,3px_3px_0px_0px_#022c22] transition-all duration-150"
                >
                  <div className="bg-emerald-800 px-5 py-4 border-b-2 border-emerald-950 rounded-t-[10px] flex items-center justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`${epilogue.className} text-[16px] font-[600] text-white tracking-wide leading-tight truncate`}
                      >
                        {job.title}
                      </span>
                      <span
                        className={`${epilogue.className} text-[10px] font-semibold uppercase tracking-wider text-amber-400 mt-0.5 truncate`}
                      >
                        {job.department || "Unit"}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-amber-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between bg-white rounded-b-[10px] font-epilogue">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`${epilogue.className} text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border-1 border-neutral-500`}
                        >
                          {job.type}
                        </span>
                        <span
                          className={`${epilogue.className} text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border-1 border-neutral-500`}
                        >
                          {job.workplace}
                        </span>
                        <span
                          className={`${epilogue.className} text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border-1 border-neutral-500`}
                        >
                          {job.experienceLevel}
                        </span>
                      </div>
                      <p
                        className={`${epilogue.className} text-xs text-neutral-600 leading-relaxed font-normal text-left line-clamp-3`}
                      >
                        {job.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                      <span
                        className={`${epilogue.className} text-[10px] text-neutral-400 font-medium`}
                      >
                        {job.postedDate
                          ? `Posted ${job.postedDate}`
                          : "Recently posted"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 px-6">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-5 border-2 border-neutral-200">
                  <SearchX className="w-7 h-7 text-neutral-400" />
                </div>
                <h3
                  className={`${poppins.className} text-lg font-bold text-neutral-800 mb-2`}
                >
                  No Job Postings Available
                </h3>
                <p
                  className={`${epilogue.className} text-sm text-neutral-500 text-center max-w-md leading-relaxed`}
                >
                  There are no open positions at the moment. Please check back
                  soon, new opportunities are posted regularly.
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={resetFilters}
                    className={`${epilogue.className} mt-6 inline-flex items-center gap-2 px-5 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none cursor-pointer`}
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    href="/"
                    className={`${epilogue.className} mt-6 inline-flex items-center gap-2 px-5 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Home
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-poppins text-neutral-900 font-extrabold uppercase">
              SPUP HRM Careers
            </span>
            <span>&bull;</span>
            <span className="font-epilogue">
              &copy; 2026 St. Paul University Philippines. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
