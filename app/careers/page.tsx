"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Briefcase,
  FileText,
  TrendingUp,
  X,
  User,
  ShieldCheck,
  Bookmark,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Job, UserProfile, Application, INITIAL_JOBS } from '@/components/hrm/types';
import JobCard from '@/components/hrm/careers/JobCard';
import JobDetailsModal from '@/components/hrm/careers/JobDetailsModal';
import ProcessTimeline from '@/components/hrm/careers/ApplicationProcess';
import FaqSection from '@/components/hrm/careers/Faq';
import JobBoardCTA from '@/components/hrm/careers/Cta';
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

export default function HrmPage() {
  const [activeTab, setActiveTab] = useState<'explore' | 'applications' | 'profile' | 'faqs' >('explore');
  const [jobs] = useState<Job[]>(INITIAL_JOBS);

  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedWorkplace, setSelectedWorkplace] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All');
    setSelectedWorkplace('All');
    setSelectedExperience('All');
    setShowSavedOnly(false);
    triggerToast('All search filters reset.');
  };

  const departments = useMemo(() => {
    return ['All', ...Array.from(new Set(jobs.map(j => j.department)))];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDepartment === 'All' || job.department === selectedDepartment;
      const matchesWorkplace = selectedWorkplace === 'All' || job.workplace === selectedWorkplace;
      const matchesExperience = selectedExperience === 'All' || job.experienceLevel === selectedExperience;
      const matchesSaved = !showSavedOnly || savedJobIds.includes(job.id);

      return matchesSearch && matchesDept && matchesWorkplace && matchesExperience && matchesSaved;
    });
  }, [jobs, searchQuery, selectedDepartment, selectedWorkplace, selectedExperience, showSavedOnly, savedJobIds]);

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
                <h1 className="text-sm font-extrabold text-neutral-900 tracking-tight leading-none uppercase">
                  SPUP HRM Careers
                </h1>
                <span className="text-[10px] font-bold text-neutral-400 mt-0.5 leading-none">
                  St. Paul University Philippines
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-6 ml-auto">
              <button 
                onClick={() => {
                  setActiveTab('explore');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} 
                className={`text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'explore' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                Home
              </button>

              <button 
                onClick={() => {
                  setActiveTab('explore');
                  setTimeout(() => {
                    document.getElementById('workspace-layout')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }} 
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                Job Openings
              </button>

              <button 
                onClick={() => setActiveTab('applications')} 
                className={`text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${activeTab === 'applications' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
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
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                FAQs
              </button>
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
              className="relative w-full h-[400px] md:h-[480px] overflow-hidden shadow-xs flex items-center bg-neutral-900 bg-cover bg-center bg-no-repeat mb-8"
              style={{ backgroundImage: "url('/img/bg-auth.png')", backgroundPosition: 'center center' }} 
            >
              <div className="absolute inset-0 bg-neutral-950/40 z-0 pointer-events-none" />

              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-10 border-2 border-emerald-900 shadow-xl flex flex-col space-y-5 [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22]">
                  <div className="space-y-3">
                    <h1 className={`${instrumentSerif.className} text-xl sm:text-4xl lg:text-5xl font-normal text-emerald-800 tracking-wide leading-tight lg:whitespace-nowrap [-webkit-text-stroke:1.5px_#065f46] [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]`}>
                      Build Your Career with SPUP
                    </h1>
                    <p className={`${inter.className} text-sm text-neutral-600 text-justify font-normal leading-relaxed`}>
                      Join a mission-driven academic community committed to service, excellence, and transformative education. Discover where your passion aligns with systemic impact.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a href="#advanced-search-box" className="inline-flex items-center justify-center gap-2 border-1 border-emerald-900 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-colors">
                      <Briefcase className="w-3.5 h-3.5" />
                      Browse Job Openings
                    </a>
                    <button onClick={() => setActiveTab('profile')} className="inline-flex items-center justify-center gap-2 border-1 border-neutral-300 bg-neutral-200 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      Setup Application Profile
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div id="workspace-layout" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        {activeTab === 'explore' && (
          <div className="space-y-6">
            
            {/* Featured Jobs Header*/}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className={`${instrumentSerif.className} text-xl sm:text-4xl lg:text-5xl font-normal text-emerald-800 tracking-wide leading-tight lg:whitespace-nowrap [-webkit-text-stroke:1.5px_#065f46] [text-shadow:0_2px_4px_rgba(0,0,0,0.15)]`}>
                  Featured Job Openings
                </h2>
              <p className={`${inter.className} text-sm text-neutral-500 mt-1`}>
                Explore premier pathways currently accepting applications.
              </p>
            </div>
              <Link 
                href="#" 
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border-1 border-emerald-950 bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
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
                          <span className="font-instrument text-[16px] font-medium text-white tracking-wide leading-tight">
                            {job.title}
                          </span>
                          <span className="font-inter text-[10px] font-bold uppercase tracking-wider text-amber-400 mt-0.5">
                            {job.department || "Academic Unit"}
                          </span>
                        </div>
                        
                        {/* Save/Bookmark Button */}
                        <button 
                          type="button" 
                          onClick={(e) => handleToggleSave(job.id, e)}
                          className="text-amber-300 hover:text-amber-400 transition-colors shrink-0 z-10"
                        >
                          <Bookmark className={`w-4 h-4 ${savedJobIds.includes(job.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between bg-white rounded-b-[10px] font-inter">
                        <div>
                          {/* Job Details Meta Row */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                              {job.type || "Full-time"}
                            </span>
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                              {job.location || "Main Campus"}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 leading-relaxed font-normal text-justify line-clamp-3">
                            {job.description}
                          </p>
                        </div>
                        
                        {/* Action Footer */}
                        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[10px] text-neutral-400 font-medium">
                            Posted {job.postedDate || "Recently"}
                          </span>
                          
                          <button 
                            type="button" 
                            onClick={() => setSelectedJob(job)}
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

        {/* Modular Feature Sections */}
        <ProcessTimeline />
        <FaqSection />
        <JobBoardCTA />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-neutral-900 font-extrabold uppercase">SPUP HRM Careers</span>
            <span>•</span>
            <span>© 2026 St. Paul University Philippines. All rights reserved.</span>
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