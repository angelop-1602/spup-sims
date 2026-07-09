"use client";

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Instrument_Serif, Inter, Epilogue } from 'next/font/google';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
});

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

export default function JobBoardCTA() {
  return (
    <section className="w-full bg-white pt-12 pb-0 rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-2xl bg-emerald-800 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.09)_0%,transparent_65%)] py-16 px-6 sm:px-12 md:px-20 text-center border-2 border-emerald-900 shadow-[4px_4px_0px_0px_rgba(251,191,36,1),5px_5px_0px_0px_rgba(180,130,10,1)]">
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 hidden md:block opacity-[0.40] select-none pointer-events-none w-60 h-60 drop-shadow-[0_0_30px_rgba(251,191,36,0.45)] transition-transform duration-300 hover:scale-105">
            <img 
              src="https://img.icons8.com/emoji/256/fleur-de-lis-emoji.png" 
              alt="Fleur-de-lis Left" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 hidden md:block opacity-[0.40] select-none pointer-events-none w-60 h-60 drop-shadow-[0_0_30px_rgba(251,191,36,0.45)] transition-transform duration-300 hover:scale-105">
            <img 
              src="https://img.icons8.com/emoji/256/fleur-de-lis-emoji.png" 
              alt="Fleur-de-lis Right" 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center">
            <h2 className={`${instrumentSerif.className} text-3xl sm:text-4xl lg:text-5xl font-normal text-amber-400 tracking-wide leading-tight lg:whitespace-nowrap [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]`}>
              Ready to shape the <span className="italic">future</span> of education?
            </h2>
            
            <p className={`${epilogue.className} text-xs sm:text-sm text-white/90 mt-4 font-normal max-w-xl leading-relaxed`}>
              Find your place in our academic and administrative community. Submit your application profile today and take the first step toward a purposeful career.
            </p>
            
            <div className="mt-8">
            <Link
              href="#featured-jobs"
              className={`${epilogue.className} group inline-flex items-center justify-center gap-2 border-2 border-emerald-950 bg-amber-400 hover:bg-amber-300 text-neutral-900 font-bold text-xs px-7 py-3 rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer`}
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-4 h-4 text-black transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}