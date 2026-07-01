"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Search,
  Bookmark,
  FileText,
  Briefcase,
  RefreshCw,
  TrendingUp,
  X,
  GraduationCap,
  BookmarkCheck,
  User,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { Job, UserProfile, Application, INITIAL_JOBS } from '@/components/hrm/types';
import JobCard from '@/components/hrm/landing/JobCard';
import JobDetailsModal from '@/components/hrm/landing/JobDetailsModal';

export default function HrmPage() {
  const [activeTab, setActiveTab] = useState<'explore' | 'applications' | 'profile'>('explore');
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
              <button onClick={() => setActiveTab('explore')} className={`text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'explore' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}>
                Home
              </button>
              <button onClick={() => setActiveTab('explore')} className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer">
                Job Openings
              </button>
              <button onClick={() => setActiveTab('applications')} className={`text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${activeTab === 'applications' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}>
                Application Process
                {applications.length > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-neutral-50 bg-neutral-900 rounded-full">
                    {applications.length}
                  </span>
                )}
              </button>
              <button onClick={() => setActiveTab('profile')} className={`text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'profile' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}>
                FAQs
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* Main Content body */}
      <main className="flex-1 w-full mx-auto space-y-8">
        
        {/* HERO BANNER SECTION */}
        <AnimatePresence mode="popLayout">
          {activeTab === 'explore' && (
            <motion.section
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="relative w-full h-[400px] md:h-[480px] overflow-hidden shadow-xs flex items-center bg-neutral-900 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/img/bg-auth.png')", backgroundPosition: 'center center' }} 
            >
              <div className="absolute inset-0 bg-neutral-950/40 z-0 pointer-events-none" />

              {/* Added responsive maximum width alignment wrapper */}
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-white/20 shadow-xl flex flex-col space-y-5">
                  <div className="space-y-3">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-950 tracking-tight leading-tight">
                      Build Your Career with SPUP
                    </h1>
                    <p className="text-xs md:text-sm text-neutral-600 font-normal leading-relaxed">
                      Join a mission-driven academic community committed to service, excellence, and transformative education. Discover where your passion aligns with systemic impact.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a href="#advanced-search-box" className="inline-flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition-colors">
                      <Briefcase className="w-3.5 h-3.5" />
                      Browse Job Openings
                    </a>
                    <button onClick={() => setActiveTab('profile')} className="inline-flex items-center justify-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold px-5 py-3 rounded-xl transition-colors cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      Setup Application Profile
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div id="workspace-layout" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === 'explore' && (
            <div className="space-y-6">
              
              {/* Featured Jobs Header*/}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight uppercase">
                    Featured Job Openings
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Explore premier pathways currently accepting applications.
                  </p>
                </div>
                <Link 
                  href="#" 
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-neutral-900 bg-neutral-950 text-white hover:bg-neutral-800 text-xs font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  View all openings
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              {/* Featured Jobs Grid Display */}
              <div id="vacancies" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {jobs.slice(0, 3).map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.includes(job.id)}
                        onToggleSave={(e) => handleToggleSave(job.id, e)}
                        onViewDetails={() => setSelectedJob(job)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="p-4 bg-white border border-neutral-200 rounded-2xl flex items-start gap-3 shadow-sm">
                <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100 text-neutral-950 flex-shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 text-sm">Post-Submission Roster Guideline</h3>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">Search committees typically review incoming academic and staff portfolios within 14 calendar days. Ensure your One-Click CV dossier remains accurate. Any updates are automatically reflected for pending reviews.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Clean fallback template replacing ProfileBuilder */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center shadow-sm max-w-2xl mx-auto flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-800 flex items-center justify-center shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-neutral-900 text-base">Application Profile Manager</h3>
                  <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                    The interactive profile and curriculum vitae builder interface is temporarily disconnected for system tuning.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-[10px] font-medium tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Your local caching and security frameworks remain active
                </div>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-4">Why Use One-Click Apply?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-mono border border-neutral-200">1</span>
                      Instant Verification
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed font-normal">Your educational degrees, reference details, and publications list are compiled into a streamlined academic dossier payload.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-mono border border-neutral-200">2</span>
                      Dynamic Synced Updates
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed font-normal">Search committees query your snapshot directly. Editing your details here keeps your application fresh before the final audit begins.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-mono border border-neutral-200">3</span>
                      Privacy Protected
                    </div>
                    <p className="text-xs text-neutral-500 leading-relaxed font-normal">Dossier parameters are kept completely local inside your sandboxed browser environment, respecting strict regulatory requirements.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-neutral-900 font-extrabold uppercase">SPUP HRM Careers</span>
            <span>•</span>
            <span>© 2026 St. Paul University Philippines. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="text-neutral-400 hover:text-neutral-900 cursor-pointer">Terms and Conditions</span>
            <span className="text-neutral-400 hover:text-neutral-900 cursor-pointer">Privacy Policy</span>
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