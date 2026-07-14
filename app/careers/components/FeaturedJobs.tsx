 "use client";

import React, { useRef, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Bookmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Job } from './types';
import { Instrument_Serif, Poppins, Inter, Epilogue } from 'next/font/google';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const CELL_SIZE = 70;

interface FeaturedJobsProps {
  activeTab: string;
  jobs: Job[];
  savedJobIds: string[];
  onToggleSave: (jobId: string, e: React.MouseEvent) => void;
  onSelectJob: (job: Job) => void;
}

export default function FeaturedJobs({
  activeTab,
  jobs,
  savedJobIds,
  onToggleSave,
  onSelectJob,
}: FeaturedJobsProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [extraPadding, setExtraPadding] = useState(0);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const adjustHeight = () => {
      el.style.paddingBottom = '0px';
      const naturalHeight = el.offsetHeight;
      const remainder = naturalHeight % CELL_SIZE;
      const needed = remainder === 0 ? 0 : CELL_SIZE - remainder;
      setExtraPadding(needed);
    };

    adjustHeight();

    const observer = new ResizeObserver(adjustHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [jobs, activeTab]);

  return (
    <div
      ref={gridRef}
      className="relative w-full -mt-8"
      style={{ paddingBottom: `${extraPadding}px` }}
    >
      <div id="workspace-layout" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {activeTab === 'explore' && (
          <div className="space-y-6">

            {/* Featured Jobs Header*/}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className={`${instrumentSerif.className} mt-6 text-3xl sm:text-4xl lg:text-5xl font-normal text-emerald-800 tracking-wide leading-tight [-webkit-text-stroke:1px_#065f46] sm:[-webkit-text-stroke:1.5px_#065f46] [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]`}>
                  Featured Job Openings
                </h2>
                <p className={`${epilogue.className} text-sm text-neutral-500 mt-2`}>
                  Explore premier pathways currently accepting applications.
                </p>
              </div>
              <Link
                href="#"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
              >
                View all openings
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Featured Jobs Grid Display */}
            <div id="vacancies" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {jobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      className="bg-white border-2 border-emerald-950 rounded-xl flex flex-col justify-between group relative overflow-visible [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]"
                    >
                      <div className="bg-emerald-800 px-5 py-4 border-b-2 border-emerald-950 rounded-t-[10px] flex items-center justify-between gap-2">
                        <div className="flex flex-col">
                          <span className={`${epilogue.className} text-[16px] font-[600] text-white tracking-wide leading-tight`}>
                            {job.title}
                          </span>
                          <span className={`${epilogue.className} text-[10px] font-semibold uppercase tracking-wider text-amber-400 mt-0.5`}>
                            {job.department || "Unit"}
                          </span>
                        </div>

                        {/* Save/Bookmark Button */}
                        <button
                          type="button"
                          className="text-amber-300 hover:text-amber-400 transition-colors shrink-0 z-10"
                        >
                          <Bookmark className={`w-4 h-4 ${savedJobIds.includes(job.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between bg-white rounded-b-[10px] font-epilogue">
                        <div>
                          {/* Job Details Meta Row */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`${epilogue.className} text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border-1 border-neutral-500`}>
                              {job.type || "Full-time"}
                            </span>
                            <span className={`${epilogue.className} text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border-1 border-neutral-500`}>
                              {job.location || "Tuguegarao City, Cagayan"}
                            </span>
                          </div>

                          <p className={`${epilogue.className} text-xs text-neutral-600 leading-relaxed font-normal text-left line-clamp-3`}>
                            {job.description}
                          </p>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                          <span className={`${epilogue.className} text-[10px] text-neutral-400 font-medium`}>
                            Posted {job.postedDate || "Recently"}
                          </span>

                          <button
                            type="button"
                            onClick={() => onSelectJob(job)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-900 hover:text-emerald-950 uppercase tracking-wider group/btn"
                          >
                            View Details
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}