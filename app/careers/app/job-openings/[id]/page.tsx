"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Star,
  MapPin,
  Calendar,
  Briefcase,
  Building2,
  Clock,
  SearchX,
  Loader2,
} from "lucide-react";
import { Instrument_Serif, Poppins, Epilogue } from "next/font/google";
import {
  Job,
  SingleJobPostingApiResponse,
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

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 bg-neutral-100 rounded w-40" />
      <div className="h-8 bg-neutral-100 rounded w-2/3" />
      <div className="flex gap-3">
        <div className="h-6 bg-neutral-100 rounded w-20" />
        <div className="h-6 bg-neutral-100 rounded w-20" />
        <div className="h-6 bg-neutral-100 rounded w-24" />
      </div>
      <div className="space-y-2 pt-4 border-t border-neutral-100">
        <div className="h-3 bg-neutral-100 rounded w-full" />
        <div className="h-3 bg-neutral-100 rounded w-full" />
        <div className="h-3 bg-neutral-100 rounded w-4/5" />
        <div className="h-3 bg-neutral-100 rounded w-3/4" />
      </div>
      <div className="space-y-2 pt-4 border-t border-neutral-100">
        <div className="h-3 bg-neutral-100 rounded w-full" />
        <div className="h-3 bg-neutral-100 rounded w-5/6" />
        <div className="h-3 bg-neutral-100 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchJob() {
      setLoading(true);
      setNotFound(false);

      try {
        const res = await fetch(
          `/api/v1/applicant/job-postings/${id}`
        );

        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }

        if (!res.ok) throw new Error("Failed to fetch");

        const json: SingleJobPostingApiResponse = await res.json();
        if (!cancelled && json.success && json.data) {
          setJob(mapApiJobToJob(json.data));
        } else if (!cancelled) {
          setNotFound(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchJob();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back Link */}
          <Link
            href="/job-openings"
            className={`${epilogue.className} inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-900 uppercase tracking-wider transition-colors mb-6`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Job Openings
          </Link>

          {/* Loading */}
          {loading && (
            <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 md:p-8">
              <DetailSkeleton />
            </div>
          )}

          {/* Not Found */}
          {!loading && notFound && (
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-5 border-2 border-neutral-200">
                <SearchX className="w-7 h-7 text-neutral-400" />
              </div>
              <h3
                className={`${poppins.className} text-lg font-bold text-neutral-800 mb-2`}
              >
                Job Posting Not Found
              </h3>
              <p
                className={`${epilogue.className} text-sm text-neutral-500 text-center max-w-md leading-relaxed`}
              >
                The position you&apos;re looking for doesn&apos;t exist or may
                have been removed.
              </p>
              <Link
                href="/job-openings"
                className={`${epilogue.className} mt-6 inline-flex items-center gap-2 px-5 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Openings
              </Link>
            </div>
          )}

          {/* Job Detail */}
          {!loading && !notFound && job && (
            <div className="bg-white border-2 border-emerald-950 rounded-xl overflow-hidden [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]">
              {/* Job Header */}
              <div className="bg-emerald-800 px-6 md:px-8 py-6 border-b-2 border-emerald-950">
                <span
                  className={`${epilogue.className} text-[10px] font-semibold uppercase tracking-widest text-amber-400`}
                >
                  {job.department || "Position Opening"}
                </span>
                <h2
                  className={`${poppins.className} text-2xl md:text-3xl font-bold text-white tracking-tight mt-1 leading-snug`}
                >
                  {job.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  {job.location && (
                    <span className="flex items-center gap-1.5 text-xs text-white/80">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                  )}
                  {job.postedDate && (
                    <span className="flex items-center gap-1.5 text-xs text-white/80">
                      <Calendar className="w-3.5 h-3.5" />
                      Posted {job.postedDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Meta Tags */}
              <div className="px-6 md:px-8 py-4 border-b border-neutral-100 flex flex-wrap gap-2">
                <span
                  className={`${epilogue.className} text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-3 py-1 rounded border border-neutral-200 flex items-center gap-1`}
                >
                  <Briefcase className="w-3 h-3" />
                  {job.type}
                </span>
                <span
                  className={`${epilogue.className} text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-3 py-1 rounded border border-neutral-200 flex items-center gap-1`}
                >
                  <Building2 className="w-3 h-3" />
                  {job.workplace}
                </span>
                <span
                  className={`${epilogue.className} text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-3 py-1 rounded border border-neutral-200 flex items-center gap-1`}
                >
                  <Clock className="w-3 h-3" />
                  {job.experienceLevel}
                </span>
              </div>

              {/* Job Body */}
              <div className="px-6 md:px-8 py-8 space-y-8">
                {/* Description */}
                <div>
                  <h3
                    className={`${epilogue.className} text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3`}
                  >
                    About this Role
                  </h3>
                  <p
                    className={`${epilogue.className} text-sm text-neutral-600 leading-relaxed font-normal text-justify`}
                  >
                    {job.description}
                  </p>
                </div>

                {/* Responsibilities */}
                {job.responsibilities.length > 0 && (
                  <div className="border-t border-neutral-100 pt-6">
                    <h3
                      className={`${epilogue.className} text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3`}
                    >
                      Key Responsibilities
                    </h3>
                    <ul className="space-y-2">
                      {job.responsibilities.map((resp, idx) => (
                        <li
                          key={idx}
                          className="flex gap-2 text-sm text-neutral-600 leading-relaxed text-justify"
                        >
                          <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements.length > 0 && (
                  <div className="border-t border-neutral-100 pt-6">
                    <h3
                      className={`${epilogue.className} text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3`}
                    >
                      Candidate Qualifications
                    </h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, idx) => (
                        <li
                          key={idx}
                          className="flex gap-2 text-sm text-neutral-600 leading-relaxed text-justify"
                        >
                          <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits.length > 0 && (
                  <div className="border-t border-neutral-100 pt-6">
                    <h3
                      className={`${epilogue.className} text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3`}
                    >
                      Compensation &amp; Perks
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {job.benefits.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-start p-3 bg-neutral-50 border border-neutral-100 rounded-lg text-xs text-neutral-600 font-medium text-justify"
                        >
                          <Star className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="px-6 md:px-8 py-5 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div
                  className={`${epilogue.className} text-xs text-neutral-400 font-medium`}
                >
                  {job.deadline
                    ? `Application deadline: ${job.deadline}`
                    : "Open for applications"}
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/job-openings"
                    className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 rounded-lg text-xs font-semibold bg-white transition-colors`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </Link>
                  <Link
                    href={`/job-openings/${id}/apply`}
                    className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none`}
                  >
                    Apply Now
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
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
