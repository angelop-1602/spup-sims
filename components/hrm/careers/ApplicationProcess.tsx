"use client";

import React from 'react';
import { Search, FileText, User, UserCheck, HelpCircle } from 'lucide-react';
import { Instrument_Serif, Inter } from 'next/font/google';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
});

// Temporary data for application requirements
const applicationRequirements = [
  {
    title: "Resume",
    description: "An updated summary of your professional background, core skills, and relevant work or life experience.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800",
  },
  {
    title: "Application Letter",
    description: "Formal cover letter addressed to the University President through the Director of Human Resource detailing your intent.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800",
    tooltip: "Application letter should be addressed to Sr. Merceditas Ang, SPC, University President, through Dr. Juana Rivera, Director of Human Resources. It should also be signed by the applicant."
  },
  {
    title: "Transcript of Records (TOR)",
    description: "Official scholastic transcript from your graduate or undergraduate educational institution.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800",
  },
  {
    title: "Diploma",
    description: "A certified true copy or scanned copy of your graduation certification degree.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800"  
  },
  {
    title: "PRC ID",
    description: "Valid Professional Regulation Commission identification card for board-regulated professions.",
    status: "If Applicable",
    statusColor: "bg-neutral-100 text-neutral-800 border-neutral-300"  
  },
  {
    title: "Certificate of Employment (COE)",
    description: "Official verification documents issued by previous employers stating your tenure and role.",
    status: "If Applicable",
    statusColor: "bg-neutral-100 text-neutral-800 border-neutral-300"  
  },
  {
    title: "Latest Performance Rating",
    description: "Most recent official performance evaluation from your previous or current employer.",
    status: "If Applicable",
    statusColor: "bg-neutral-100 text-neutral-800 border-neutral-300"
  },
  {
    title: "Certificates of Training",
    description: "Official documents issued by training providers or institutions.",
    status: "If Applicable",
    statusColor: "bg-neutral-100 text-neutral-800 border-neutral-300",
    tooltip: "Compile all relevant certificates of training, seminars, workshops, and other professional development programs you have attended."
  }
];

export default function ProcessTimeline() {
  return (
    <section className="bg-white border-t border-neutral-200 pt-12 pb-0 w-full rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  
        {/* Application Process Title */}
        <div className="mb-8 text-left">
          <h2 className={`${instrumentSerif.className} text-3xl sm:text-4xl lg:text-5xl font-normal text-emerald-800 tracking-wide leading-tight [-webkit-text-stroke:1px_#065f46] sm:[-webkit-text-stroke:1.5px_#065f46] [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]`}>
            Our Application Process
          </h2>
          <p className={`${inter.className} text-sm text-neutral-500 mt-1`}>
            A simple four-step pathway to joining the SPUP academic and staff community.
          </p>
        </div>

        {/* Application Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full mb-16">
          
          {/* Step 1 */}
          <div className="bg-white border-2 border-emerald-950 rounded-xl flex flex-col justify-between group relative overflow-hidden [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]">
            <div className="bg-emerald-800 px-5 py-4 border-b-2 border-emerald-950 rounded-t-[10px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <span className="font-mono text-amber-400 text-sm">01.</span>
                <span>Choose a Position</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between bg-white rounded-b-[10px] relative min-h-[140px]">
              <p className="text-xs text-neutral-600 leading-relaxed font-normal text-justify z-10">
                Browse current openings and locate roles that match your expertise.
              </p>
              <Search className="absolute -bottom-1 -right-1 w-25 h-25 text-amber-100/70 pointer-events-none transform -rotate-12 z-0" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-2 border-emerald-950 rounded-xl flex flex-col justify-between group relative overflow-hidden [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]">
            <div className="bg-emerald-800 px-5 py-4 border-b-2 border-emerald-950 rounded-t-[10px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <span className="font-mono text-amber-400 text-sm">02.</span>
                <span>Submit Application</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between bg-white rounded-b-[10px] relative min-h-[140px]">
              <p className="text-xs text-neutral-600 leading-relaxed font-normal text-justify z-10">
                Complete your application profile and upload required documents.
              </p>
              <FileText className="absolute -bottom-4 -right-2 w-25 h-25 text-amber-100/70 pointer-events-none transform -rotate-12 z-0" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border-2 border-emerald-950 rounded-xl flex flex-col justify-between group relative overflow-hidden [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]">
            <div className="bg-emerald-800 px-5 py-4 border-b-2 border-emerald-950 rounded-t-[10px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <span className="font-mono text-amber-400 text-sm">03.</span>
                <span>HR Screening</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between bg-white rounded-b-[10px] relative min-h-[140px]">
              <p className="text-xs text-neutral-600 leading-relaxed font-normal text-justify z-10">
                The Human Resource Management Office conducts an initial credentials review.
              </p>
              <User className="absolute -bottom-4 -right-2 w-25 h-25 text-amber-100/70 pointer-events-none transform -rotate-12 z-0" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white border-2 border-emerald-950 rounded-xl flex flex-col justify-between group relative overflow-hidden [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]">
            <div className="bg-emerald-800 px-5 py-4 border-b-2 border-emerald-950 rounded-t-[10px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <span className="font-mono text-amber-400 text-sm">04.</span>
                <span>Evaluation</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between bg-white rounded-b-[10px] relative min-h-[140px]">
              <p className="text-xs text-neutral-600 leading-relaxed font-normal text-justify z-10">
                Qualified candidates undergo departmental evaluations. Most roles require an interview, while teaching applicants must also perform a demonstration.
              </p>
              <UserCheck className="absolute -bottom-4 -right-2 w-25 h-25 text-amber-100/70 pointer-events-none transform -rotate-12 z-0" />
            </div>
          </div>

        </div>
      </div>

      <hr className="w-full my-12 border-neutral-200" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Requirements Title Block */}
        <div className="mb-8 text-left">
          <h2 className={`${instrumentSerif.className} text-3xl sm:text-4xl lg:text-5xl font-normal text-emerald-800 tracking-wide leading-tight [-webkit-text-stroke:1px_#065f46] sm:[-webkit-text-stroke:1.5px_#065f46] [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]`}>
            Application Requirements
          </h2>
          <p className={`${inter.className} text-sm text-neutral-500 mt-1`}>
            Please prepare the following valid credentials and documentation for your submission.
          </p>
        </div>

        {/* Requirements Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {applicationRequirements.map((req, index) => (
          <div 
            key={index} 
            className="bg-white border-2 border-emerald-950 rounded-xl flex flex-col justify-between group relative overflow-visible [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]"
          >
            <div className="bg-emerald-800 px-5 py-4 border-b-2 border-emerald-950 rounded-t-[10px] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                <FileText className="w-4 h-4 text-white shrink-0" />
                <span>{req.title}</span>
              </div>
              
              {req.tooltip && (
                <div className="relative flex items-center justify-center">
                  <button type="button" className="text-amber-300/80 hover:text-white transition-colors cursor-help">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  
                  {/* Hover Tooltip Popup*/}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-neutral-900 text-white text-[10px] rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 text-left leading-normal font-normal normal-case tracking-normal">
                    {req.tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                  </div>
                </div>
              )}
            </div>
            
            {/* White Content Block */}
            <div className="p-5 flex-1 flex flex-col justify-between bg-white rounded-b-[10px]">
              <p className="text-xs text-neutral-600 leading-normal font-normal text-justify">
                {req.description}
              </p>
              
              {/* Status Area */}
              <div className="mt-5 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border-2 ${req.statusColor}`}>
                  {req.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}