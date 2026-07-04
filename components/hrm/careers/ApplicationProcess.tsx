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
    description: "An updated summary of your professional milestones, technical expertise, and employment background.",
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
    title: "Valid ID",
    description: "A clear, scanned copy of any valid government-issued identification card to verify your identity.",
    status: "Required",
    statusColor: "bg-red-800 text-white border-red-800",
    tooltip: "E.g., List of valid IDs: Insert them here."
  },
  {
    title: "PRC ID",
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
    <section className="bg-white border-t border-neutral-200 pt-12 pb-0 w-full rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Application Process Title Block */}
        <div className="mb-12 text-left">
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight uppercase">
            Our Application Process
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            A simple four-step pathway to joining the SPUP academic and staff community.
          </p>
        </div>

        {/* Application Process Steps Timeline */}
        <div className="relative w-full mb-16">
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
              <p className="text-xs text-neutral-500 mt-1.5 max-w-[180px] leading-relaxed">Upload your digital resume and complete the application profile.</p>
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
      </div>

      <hr className="w-full my-12 border-neutral-200" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Requirements Title Block */}
        <div className="mb-8 text-left">
          <h2 className={`${instrumentSerif.className} text-xl sm:text-4xl lg:text-5xl font-normal text-emerald-800 tracking-wide leading-tight lg:whitespace-nowrap [-webkit-text-stroke:1.5px_#065f46] [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]`}>
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
              
              {/* Tooltip Target Icon */}
              <div className="relative flex items-center justify-center">
                <button type="button" className="text-amber-300/80 hover:text-white transition-colors cursor-help">
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                
                {/* Hover Tooltip Popup*/}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2.5 bg-neutral-900 text-white text-[10px] rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 text-center leading-normal font-normal normal-case tracking-normal">
                  {req.tooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                </div>
              </div>
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