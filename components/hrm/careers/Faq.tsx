"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const faqData: Record<string, { id: string; question: string; answer: string }[]> = {
  'General': [
    {
      id: 'g1',
      question: 'How do I get started with my application?',
      answer: 'Begin by reviewing the available positions in the "Featured Job Openings" section on our homepage. Once you find a role that aligns with your background, click "View Details" to start your application.'
    },
    {
      id: 'g2',
      question: 'What file formats are accepted for document uploads?',
      answer: 'All required documents must be scanned and uploaded in PDF format. Please ensure that each individual file size does not exceed 5MB.'
    },
    {
      id: 'g3',
      question: 'Is my personal information safe?',
      answer: 'Data privacy is a matter of paramount importance to us. In strict compliance with the Data Privacy Act of 2012 (R.A. 10173), all profile details and uploaded documents are securely processed to guarantee the absolute confidentiality and protection of your personal data.'
    }
  ],
  'Requirements': [
    {
      id: 'r1',
      question: 'What should I do if I do not have a PRC license or COE yet?',
      answer: 'These documents are only mandatory if they apply directly to your specific profession, such as board-regulated academic disciplines. If they are not required for your role or are currently being processed, you may leave those fields blank for the time being.'
    },
    {
      id: 'r2',
      question: 'Can I initially submit an unofficial Transcript of Records (TOR)?',
      answer: 'A clear copy of your temporary or unofficial transcript is acceptable for the initial screening phase. However, should your application advance further in the selection process, you will be required to provide an official, certified true copy.'
    }
  ],
  'Application Process': [
    {
      id: 'p1',
      question: 'How long does the initial screening process usually take?',
      answer: 'The Human Resource Management Office typically reviews submissions within 14 calendar days. We appreciate your patience during this period, and you are welcome to monitor your application status directly through this portal.'
    },
    {
      id: 'p2',
      question: 'What are the next steps if my profile passes the initial HR evaluation?',
      answer: 'If your credentials satisfy the core requirements of the position, our HR team will contact you directly to arrange an official interview with the respective departmental evaluation committee.'
    }
  ],
  'System Support': [
    {
      id: 's1',
      question: 'Who should I contact if I experience technical difficulties?',
      answer: 'If you encounter any technical glitches or document upload errors, please send an email describing the issue to support@spup.edu.ph. Our system support team will assist you as promptly as possible.'
    }
  ]
};

export default function FaqSection() {
  const [activeTab, setActiveTab] = useState<string>('General');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const currentFaqs = faqData[activeTab] || [];

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    setOpenFaqId(null); 
  };

  return (
    <section className="bg-white pt-12 pb-0 w-full rounded-none">
      <hr className="w-full mb-12 border-neutral-200" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-left"> 
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight uppercase">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            We compiled a list of answers to address your most pressing questions regarding our pathways and application mechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar Tabs */}
          <div className="md:col-span-3 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 pb-2 md:pb-0 border-b md:border-b-0 border-neutral-100">
            {Object.keys(faqData).map((cat) => {
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleTabChange(cat)}
                  className={`text-xs font-semibold px-4 py-2.5 rounded-xl text-left whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                    isActive 
                      ? 'bg-neutral-100 text-neutral-900 font-bold' 
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Accordion Content Stack */}
          <div className="md:col-span-9 space-y-0.5 border-t border-neutral-100 md:border-t-0">
            {currentFaqs.map((item) => {
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

            {/* Support Box Link Footer Block */}
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