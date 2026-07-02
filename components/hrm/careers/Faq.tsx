"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const faqItems = [
  {
    id: 'q1',
    question: 'How do I get started with my application tracking?',
    answer: 'Browse available job openings on the Home dashboard, locate a position that aligns with your educational background, and select "View Details" to initiate your onboarding profile submission.'
  },
  {
    id: 'q2',
    question: 'Are there training resources available for new system users?',
    answer: 'Absolutely! We provide complete technical walk-through documentation, user guides, and interactive support run-through channels to bring incoming academic faculty and administrative personnel quickly up to operational speed.'
  },
  {
    id: 'q3',
    question: 'What file formats are recognized by the screening engines?',
    answer: 'All formal digital dossiers, including Application Letters, CVs, and official Transcript of Records payloads must be submitted in a unified PDF configuration under 5MB.'
  },
  {
    id: 'q4',
    question: 'Are my credentials and reference indices secure?',
    answer: 'Yes, absolutely. Profile metrics and data points reside encrypted within a secure server registry layout adhering closely to native data protection policies.'
  }
];

export default function FaqSection() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  return (
    <section className="bg-white p-6 md:p-10 shadow-xs mt-0 w-full">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center"> 
          <h2 className="text-2xl text-left uppercase font-extrabold text-neutral-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-left text-neutral-500 mt-1">
            We compiled a list of answers to address your most pressing questions regarding our pathways and application mechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <div className="md:col-span-3 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-2 md:pb-0 border-b md:border-b-0 border-neutral-100">
            {['General', 'Requirements', 'Application Process', 'System Support'].map((cat, idx) => (
              <button
                key={idx}
                type="button"
                className={`text-xs font-semibold px-4 py-2.5 rounded-xl text-left whitespace-nowrap transition-all duration-200 shrink-0 ${
                  idx === 0 ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accordion Column */}
          <div className="md:col-span-9 space-y-0.5 border-t border-neutral-100 md:border-t-0">
            {faqItems.map((item) => {
              const isOpen = openFaqId === item.id;
              
              return (
                <div 
                  key={item.id} 
                  className={`border-b border-neutral-100 transition-colors duration-200 ${isOpen ? 'bg-neutral-50/40 rounded-xl px-4 py-2' : 'py-1'}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="w-full py-4 flex items-center justify-between text-left gap-4 hover:text-neutral-900 group cursor-pointer"
                  >
                    <span className={`text-xs tracking-wide transition-colors ${isOpen ? 'font-bold text-neutral-950' : 'font-semibold text-neutral-800'}`}>
                      {item.question}
                    </span>
                    <span className="text-neutral-400 group-hover:text-neutral-600 transition-colors text-sm font-mono shrink-0 select-none">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-neutral-500 pb-4 pr-6 font-normal leading-relaxed">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Support Callout Box */}
            <div className="pt-8">
              <div className="bg-neutral-50/60 border border-neutral-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 tracking-wide">Still have questions?</h4>
                  <p className="text-[11px] text-neutral-400 mt-1 font-normal">Please connect with our system support team, we're happy to help!</p>
                </div>
                <Link
                  href="mailto:support@spup.edu.ph"
                  className="inline-flex items-center justify-center bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-[11px] font-bold px-4 py-2.5 rounded-xl shadow-2xs transition-colors shrink-0 text-center"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}