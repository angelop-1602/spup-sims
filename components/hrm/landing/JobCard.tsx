import React from 'react';
import { motion } from 'framer-motion'; 
import { ArrowUpRight, Briefcase, Bookmark, BookmarkCheck, School } from 'lucide-react';
import { Job } from '@/components/hrm/types';

interface JobCardProps {
  key?: string;
  job: Job;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
  onViewDetails: () => void;
}

export default function JobCard({ job, isSaved, onToggleSave, onViewDetails }: JobCardProps) {
  const workplaceStyles = {
    'Onsite': 'bg-neutral-100 text-neutral-800 border-neutral-200',
    'Hybrid': 'bg-neutral-200 text-neutral-900 border-neutral-300',
    'Remote': 'bg-neutral-900 text-neutral-100 border-neutral-950',
  };

  const experienceStyles = {
    'Entry Level': 'border-neutral-200 text-neutral-600',
    'Mid Level': 'border-neutral-300 text-neutral-700',
    'Senior Level': 'border-neutral-400 text-neutral-800 font-medium',
    'Director / Lead': 'border-neutral-800 text-neutral-950 font-semibold bg-neutral-50',
  };

  return (
    <motion.div
      id={`job-card-${job.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col h-full justify-between transition-all duration-300 hover:border-neutral-900 hover:shadow-xl hover:shadow-neutral-200/40"
    >
      {/* Top Main Section Layout */}
      <div className="w-full">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base md:text-lg font-extrabold text-neutral-900 group-hover:text-neutral-950 tracking-tight leading-snug break-words">
              {job.title}
            </h3>

            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mt-1.5">
              <School className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              {job.department}
            </span>
          </div>

          <button
            id={`save-btn-${job.id}`}
            onClick={onToggleSave}
            className="p-2.5 rounded-full border border-neutral-100 bg-neutral-50/50 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 hover:border-neutral-300 transition-all duration-200 flex-shrink-0"
            title={isSaved ? "Saved Opportunity" : "Save Opportunity"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-neutral-900" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Basic job information */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border border-neutral-200 font-semibold text-neutral-600 bg-neutral-50">
            <Briefcase className="w-3 h-3" />
            {job.type}
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border font-semibold ${workplaceStyles[job.workplace]}`}>
            {job.workplace}
          </span>
          <span className={`inline-flex items-center text-[11px] px-2.5 py-1 rounded-md border ${experienceStyles[job.experienceLevel]}`}>
            {job.experienceLevel}
          </span>
        </div>

        {/* Short description preview */}
        <p className="text-neutral-500 text-xs md:text-sm mb-6 leading-relaxed line-clamp-2 font-normal">
          {job.description}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-100 mt-auto w-full">
        <button
          id={`view-details-${job.id}`}
          onClick={onViewDetails}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-50 text-neutral-900 text-[11px] font-bold rounded-lg border border-neutral-200 group-hover:bg-neutral-900 group-hover:text-white transition-all duration-200 uppercase tracking-wider cursor-pointer whitespace-nowrap"
        >
          <span>View & Apply</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </motion.div>
  );
}