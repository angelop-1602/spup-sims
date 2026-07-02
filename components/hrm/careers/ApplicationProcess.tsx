"use client";

import React from 'react';
import { Search, FileText, User, UserCheck, HelpCircle } from 'lucide-react';

const applicationRequirements = [
  {
    title: "Resume",
    description: "An updated, one-page summary of your professional milestones, technical expertise, and employment background.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800",
    tooltip: "Insert additional information here."
  },
  {
    title: "Application Letter",
    description: "Formal cover letter addressed to the Human Resource Management Office detailing your intent.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800",
    tooltip: "Insert additional information here."
  },
  {
    title: "Transcript of Records (TOR)",
    description: "Official scholastic transcript from your graduate or undergraduate educational institution.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800",
    tooltip: "Insert additional information here."
  },
  {
    title: "Diploma",
    description: "A certified true copy or photocopy of your graduation certification degree.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800",
    tooltip: "Insert additional information here."
  },
  {
    title: "PRC License",
    description: "Valid Professional Regulation Commission identification card for board-regulated professions.",
    status: "If Applicable",
    statusColor: "bg-neutral-100 text-neutral-800 border-neutral-300",
    tooltip: "Insert additional information here."
  },
  {
    title: "Certificate of Employment (COE)",
    description: "Official verification documents issued by previous employers stating your tenure and role.",
    status: "If Applicable",
    statusColor: "bg-neutral-100 text-neutral-800 border-neutral-300",
    tooltip: "Insert additional information here."
  }
];

export default function ProcessTimeline() {
  return (
    <section className="bg-white border border-neutral-200 p-6 md:p-10 shadow-xs w-full rounded-none">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-left">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight uppercase">
            Our Application Process
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            A simple four-step pathway to joining the SPUP academic and staff community.
          </p>
        </div>

        {/* Application Process Steps */}
        <div className="relative w-full mb-12">
          <div className="hidden md:block absolute top-5 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-neutral-200 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-neutral-950 text-white font-bold text-sm flex items-center justify-center border border-neutral-800 shadow-xs">1</div>
              <div className="my-4 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-800">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Choose a Position</h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-[180px] leading-relaxed">Browse openings and locate roles that match your expertise.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-neutral-950 text-white font-bold text-sm flex items-center justify-center border border-neutral-800 shadow-xs">2</div>
              <div className="my-4 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-800">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Submit Application</h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-[180px] leading-relaxed">Upload your digital curriculum vitae and complete the application profile.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-neutral-950 text-white font-bold text-sm flex items-center justify-center border border-neutral-800 shadow-xs">3</div>
              <div className="my-4 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-800">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">HR Screening</h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-[180px] leading-relaxed">The Human Resource Management Office conducts an initial credentials audit.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-neutral-950 text-white font-bold text-sm flex items-center justify-center border border-neutral-800 shadow-xs">4</div>
              <div className="my-4 p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-800">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Interview & Evaluation</h3>
              <p className="text-xs text-neutral-500 mt-1.5 max-w-[180px] leading-relaxed">Qualified candidates meet with departmental committees for evaluations.</p>
            </div>
          </div>
        </div>

        <hr className="my-12 border-neutral-200" />

        {/* Requirements Section */}
        <div className="mb-8 text-left">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight uppercase">
            Application Requirements
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Please prepare the following valid credentials and documentation payloads for your dossier submission.
          </p>
        </div>

        {/* Requirements Cards Grid with Tooltips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {applicationRequirements.map((req, index) => (
            <div key={index} className="p-5 bg-white border border-neutral-200 rounded-xl shadow-2xs flex flex-col justify-between group relative">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-neutral-900 shrink-0" />
                    <span>{req.title}</span>
                  </div>
                  
                  {/* Tooltip Target Icon */}
                  <div className="relative flex items-center justify-center">
                    <button type="button" className="text-neutral-400 hover:text-neutral-600 transition-colors cursor-help">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    
                    {/* Hover Tooltip Popup */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-neutral-900 text-white text-[10px] rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-30 text-center leading-normal font-normal">
                      {req.tooltip}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                    </div>
                  </div>
                </div>
                
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-normal">
                  {req.description}
                </p>
              </div>
              
              <div className="mt-5 flex items-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${req.statusColor}`}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}