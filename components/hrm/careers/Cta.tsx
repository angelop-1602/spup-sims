"use client";

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function JobBoardCTA() {
  return (
    <section className="w-full bg-white pt-12 pb-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-2xl bg-emerald-800 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.09)_0%,transparent_65%)] py-16 px-6 sm:px-12 md:px-20 text-center shadow-md border border-emerald-700/30">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="absolute -left-30 top-1/2 -translate-y-1/2 hidden md:block opacity-[0.18] select-none pointer-events-none w-60 h-60 transition-transform duration-300 hover:scale-105">
            <img 
              src="https://img.icons8.com/emoji/256/fleur-de-lis-emoji.png" 
              alt="Fleur-de-lis Left" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="absolute -right-30 top-1/2 -translate-y-1/2 hidden md:block opacity-[0.18] select-none pointer-events-none w-60 h-60 transition-transform duration-300 hover:scale-105">
            <img 
              src="https://img.icons8.com/emoji/256/fleur-de-lis-emoji.png" 
              alt="Fleur-de-lis Right" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center justify-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.12)]">
              Ready to shape the future of education?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-3 font-medium max-w-xl leading-relaxed">
              Find your place in our academic and administrative community. Submit your application profile today and take the first step toward a purposeful career.
            </p>
            
            <div className="mt-8">
              <Link
                href="#featured-jobs" 
                className="inline-flex items-center justify-center bg-white text-neutral-900 hover:bg-neutral-50 font-bold text-xs px-7 py-3 rounded-full shadow-xs hover:shadow-md transition-all duration-200 gap-1.5 group cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-800 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}