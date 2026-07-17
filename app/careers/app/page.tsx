"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  FileText,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Job, UserProfile, Application, JobPostingsApiResponse, mapApiJobToJob } from '@/components/landing/types';
import FeaturedJobs from '@/components/landing/FeaturedJobs';
import JobDetailsModal from '@/components/landing/JobDetailsModal';
import ProcessTimeline from '@/components/landing/ApplicationProcess';
import FaqSection from '@/components/landing/Faq';
import JobBoardCTA from '@/components/landing/Cta';
import { useRouter } from 'next/navigation';
import { AccountMenu } from '@/components/auth/account-menu';
import { logout, useAuthStatus } from '@/hooks/use-auth-status';

export default function LandingPage() {
  const router = useRouter();
  const { status, profile: authProfile } = useAuthStatus();
  const displayName = authProfile
    ? `${authProfile.profile.firstName} ${authProfile.profile.lastName}`.trim()
    : "Applicant User";
  const emailLabel = authProfile?.profile.personalEmail || "";
  const [activeTab, setActiveTab] = useState<'explore' | 'applications' | 'profile' | 'faqs' >('explore');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);

  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'home' | 'process' | 'faqs'>('home');

  useEffect(() => {
    const cachedIds = localStorage.getItem('edu_careers_saved_ids');
    const cachedProfile = localStorage.getItem('edu_careers_profile');
    const cachedApps = localStorage.getItem('edu_careers_applications');

    if (cachedIds) setSavedJobIds(JSON.parse(cachedIds));
    if (cachedProfile) setUserProfile(JSON.parse(cachedProfile));
    if (cachedApps) setApplications(JSON.parse(cachedApps));
  }, []);

  useEffect(() => {
    if (savedJobIds.length > 0) {
      localStorage.setItem('edu_careers_saved_ids', JSON.stringify(savedJobIds));
    }
  }, [savedJobIds]);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('edu_careers_profile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('edu_careers_profile');
    }
  }, [userProfile]);

  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('edu_careers_applications', JSON.stringify(applications));
    }
  }, [applications]);

  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      setJobsLoading(true);
      try {
        const res = await fetch('/api/v1/applicant/job-postings');
        if (!res.ok) throw new Error('Failed to fetch');
        const json: JobPostingsApiResponse = await res.json();
        if (!cancelled && json.success && json.data?.data) {
          setJobs(json.data.data.map(mapApiJobToJob));
        }
      } catch {
        if (!cancelled) setJobs([]);
      } finally {
        if (!cancelled) setJobsLoading(false);
      }
    }
    fetchJobs();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const processEl = document.getElementById('process');
    const faqsEl = document.getElementById('faqs');

    if (!processEl || !faqsEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (id === 'faqs') setActiveSection('faqs');
          else if (id === 'process') setActiveSection('process');
        } else {
          const scrollY = window.scrollY + 120;
          if (scrollY < processEl.offsetTop) setActiveSection('home');
        }
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    observer.observe(processEl);
    observer.observe(faqsEl);

    return () => {
      observer.disconnect();
    };
  }, [jobs]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleToggleSave = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter(id => id !== jobId));
      triggerToast('Opportunity removed from saved collection.');
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      triggerToast('Opportunity successfully saved to your collection.');
    }
  };

  const handleApplySuccess = (job: Job, submittedProfile: UserProfile) => {
    const newApplication: Application = {
      id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      jobId: job.id,
      jobTitle: job.title,
      department: job.department,
      appliedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      status: 'Submitted',
      timeline: [
        {
          status: 'Submitted',
          date: new Date().toLocaleDateString('en-US'),
          description: 'Dossier successfully registered in the HR database.'
        }
      ],
      profileSnapshot: submittedProfile
    };

    setApplications([newApplication, ...applications]);
    triggerToast(`Successfully applied to ${job.title}! Track status under 'My Applications'`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col antialiased selection:bg-neutral-900 selection:text-white">
      
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-neutral-950 text-neutral-100 rounded-xl px-5 py-3.5 shadow-xl border border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-100 animate-pulse"></span>
                {toastMessage}
              </span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header / Navigation */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('explore')}>
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
            </div>

            <nav className="flex items-center gap-6 ml-auto font-epilogue">
              <button 
                onClick={() => {
                  setActiveTab('explore');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className={`text-[11px] font-semibold transition-colors cursor-pointer ${activeSection === 'home' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Home
              </button>

              <Link 
                href="/job-openings"
                className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                Job Openings
              </Link>

              <button 
                onClick={() => {
                  setActiveTab('explore');
                  setTimeout(() => {
                    document.getElementById('process')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                className={`text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${activeSection === 'process' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Application Process
                {applications.length > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-neutral-50 bg-neutral-900 rounded-full">
                    {applications.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => {
                  setActiveTab('explore');
                  setTimeout(() => {
                    document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }} 
                className={`text-[11px] font-semibold transition-colors cursor-pointer ${activeSection === 'faqs' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                FAQs
              </button>

              {status === "authenticated" ? (
                <AccountMenu
                  displayName={displayName}
                  email={emailLabel}
                  onLogout={() => logout(router)}
                />
              ) : (
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors cursor-pointer shadow-sm"
                >
                  Login / Register
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content body */}
      <main className="flex-1 w-full mx-auto pb-12">
        
        {/* HERO BANNER SECTION */}
        <AnimatePresence mode="popLayout">
          {activeTab === 'explore' && (
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="relative w-full h-[560px] md:h-[600px] overflow-hidden shadow-xs flex items-center bg-white mb-8"
            >
              {/* Grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_80%)]" />

              {/* Blobs */}
              <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" /> {/* Top left green blob */}
              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full border-2 border-emerald-900/30 pointer-events-none" /> {/* Top left green circle outline */}

              <div className="absolute -bottom-28 -right-16 w-80 h-80 bg-emerald-200/35 rounded-full blur-3xl pointer-events-none" /> {/* Bottom right green blob */}
              <div className="absolute -bottom-28 -right-16 w-80 h-80 rounded-full border-2 border-emerald-900/30 pointer-events-none" /> {/* Bottom right green circle outline*/}
              
              <div className="absolute top-2 right-2 sm:top-6 sm:right-6 w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 bg-amber-200/40 rounded-full blur-2xl sm:blur-3xl pointer-events-none" /> {/* Top right yellow blob */}
              <div className="absolute bottom-2 left-2 sm:bottom-6 sm:left-6 w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 bg-amber-100/40 rounded-full blur-2xl sm:blur-3xl pointer-events-none" /> {/* Bottom left yellow blob */}

              <div className="absolute top-1 left-1/3 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 md:w-[300px] md:h-[300px] bg-amber-100/40 rounded-full blur-2xl sm:blur-3xl pointer-events-none" /> {/* Top left yellow blob */}
              <div className="absolute bottom-1 right-1/3 w-36 h-36 sm:w-52 sm:h-52 md:w-72 md:h-72 bg-emerald-200/30 rounded-full blur-2xl sm:blur-3xl pointer-events-none" /> {/* Bottom right green blob */}

              <div className="hidden sm:block absolute top-32 sm:top-50 left-1/4 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-[100px] sm:h-[100px] rounded-full border-2 border-emerald-900/30 pointer-events-none" /> {/* Left green circle outline */}
              <div className="hidden sm:block absolute top-40 sm:top-60 left-1/5 -translate-x-1/10 -translate-y-1/2 w-12 h-12 sm:w-[80px] sm:h-[80px] rounded-full bg-amber-400/30 pointer-events-none" /> {/* Left yellow circle */}

              <div className="hidden md:block absolute -top-1 right-[22%] -translate-x-1/20 -translate-y-1/5 w-[40px] h-[40px] rounded-full bg-emerald-900/30 pointer-events-none" /> {/* Top right green circle */}
              <div className="absolute top-0 right-[18%] -translate-x-1/2 -translate-y-1/5 w-[60px] h-[60px] rounded-full border-2 border-amber-400/30 pointer-events-none" /> {/* Top right bigger yellow circle outline */}
              <div className="absolute top-12 right-[18%] -translate-x-1/2 -translate-y-1/5 w-[24px] h-[24px] rounded-full border-2 border-amber-400/30 pointer-events-none" /> {/* Top right smaller yellow circle outline */}

              <div className="hidden sm:block absolute bottom-14 sm:bottom-20 right-[30%] w-24 h-24 sm:w-40 sm:h-40 rounded-full border-2 border-amber-400/30 pointer-events-none" /> {/* Bottom right yellow circle outline */}
              <div className="hidden sm:block absolute bottom-32 sm:bottom-50 right-[29%] w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-emerald-900/30 pointer-events-none" /> {/* Bottom right green circle */}
              <div className="hidden md:block absolute bottom-22 right-[65%] w-20 h-20 rounded-full bg-emerald-900/30 pointer-events-none" /> {/* Bottom left green bar */}

              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="relative w-full max-w-2xl mx-auto text-center bg-white border-2 border-emerald-950 rounded-2xl p-8 md:p-10 shadow-[6px_6px_0px_0px_#022c22]">
                  <div className="font-epilogue absolute -top-6 -right-6 bg-amber-400 border-2 border-amber-900 rounded-full w-16 h-16 flex items-center justify-center rotate-12 shadow-[3px_3px_0px_0px_#78350f] text-[10px] font-black text-neutral-900 text-center uppercase leading-tight">
                    Apply Today!
                  </div>
                  <div className="space-y-3">
                    <h1 className="font-poppins text-5xl text-center sm:text-4xl lg:text-6xl font-bold text-emerald-800 tracking-wide leading-tight [-webkit-text-stroke:1px_#065f46] md:[-webkit-text-stroke:1.5px_#065f46] [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]">
                      Build Your Career with SPUP
                    </h1>
                    <p className="font-epilogue text-sm text-black text-center font-normal leading-relaxed">
                      Join a mission-driven academic community committed to service, excellence, and transformative education. Discover where your passion aligns with systemic impact.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-5 justify-center">
                    <Link 
                      href="/job-openings" 
                      className="font-poppins inline-flex items-center justify-center gap-2 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Browse Job Openings
                    </Link>
                    <Link 
                      href={status === "authenticated" ? "/applicant/profile" : "/register"} 
                      className="font-epilogue inline-flex items-center justify-center gap-2 border-2 border-emerald-950 bg-amber-400 hover:bg-amber-300 text-neutral-900 text-xs font-bold px-5 py-3 rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {status === "authenticated" ? "Edit my Application Profile" : "Setup Application Profile"}
                    </Link>
                  </div>

                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
        <FeaturedJobs
          activeTab={activeTab}
          jobs={jobs}
          loading={jobsLoading}
          savedJobIds={savedJobIds}
          onToggleSave={handleToggleSave}
          onSelectJob={setSelectedJob}
        />
        <ProcessTimeline />
        <FaqSection />
        <JobBoardCTA />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-poppins text-neutral-900 font-extrabold uppercase">SPUP HRM Careers</span>
            <span>•</span>
            <span className="font-epilogue">© 2026 St. Paul University Philippines. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          userProfile={userProfile}
          hasApplied={applications.some(app => app.jobId === selectedJob.id)}
          onApplySuccess={handleApplySuccess}
          onSaveProfile={(prof) => setUserProfile(prof)}
        />
      )}
    </div>
  );
}