import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, CheckCircle2, ChevronRight, FileText, Loader2, Star } from 'lucide-react';
import { Job, UserProfile } from '@/components/landing/types';
import { Epilogue } from 'next/font/google';

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

interface JobDetailsModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onApplySuccess: (job: Job, submittedProfile: UserProfile) => void;
  hasApplied: boolean;
  onSaveProfile: (profile: UserProfile) => void;
}

export default function JobDetailsModal({
  job,
  isOpen,
  onClose,
  userProfile,
  onApplySuccess,
  hasApplied,
  onSaveProfile
}: JobDetailsModalProps) {
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [education, setEducation] = useState<string>('');
  const [resumeContent, setResumeContent] = useState<string>('');
  const [saveToProfile, setSaveToProfile] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  if (!isOpen) return null;

  const handleOneClickApply = () => {
    if (!userProfile) return;
    setIsApplying(true);

    setTimeout(() => {
      setIsApplying(false);
      setIsSuccess(true);
      onApplySuccess(job, userProfile);
    }, 1800);
  };

  const handleManualApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !education || !resumeContent) {
      setFormError('Please fill in all fields to complete your application.');
      return;
    }

    const payload: UserProfile = {
      fullName,
      email,
      phone,
      education,
      resumeName: 'Instant_Inline_Resume.pdf',
      resumeContent
    };

    setIsApplying(true);
    setFormError('');

    setTimeout(() => {
      setIsApplying(false);
      setIsSuccess(true);
      if (saveToProfile) {
        onSaveProfile(payload);
      }
      onApplySuccess(job, payload);
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative bg-white border-2 border-emerald-950 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col [box-shadow:4px_4px_0px_0px_#facc15,5px_5px_0px_0px_#022c22] z-10"
        >
          {/* Header */}
          <div className="bg-emerald-800 px-6 py-5 border-b-2 border-emerald-950 rounded-t-[10px] flex justify-between items-start sticky top-0 z-20">
            <div>
              <span className={`${epilogue.className} text-[10px] font-semibold uppercase tracking-wider text-amber-400`}>
                {job.department}
              </span>
              <h2 className={`${epilogue.className} text-lg md:text-xl font-bold text-white mt-1 leading-snug tracking-wide`}>
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`${epilogue.className} inline-flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-900/50 text-emerald-100 px-2.5 py-1 rounded border border-emerald-700`}>
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
                {job.type && (
                  <span className={`${epilogue.className} inline-flex items-center gap-1.5 text-[10px] font-semibold bg-emerald-900/50 text-emerald-100 px-2.5 py-1 rounded border border-emerald-700`}>
                    {job.type}
                  </span>
                )}
              </div>
            </div>

            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-emerald-700 text-emerald-200 hover:text-white hover:bg-emerald-900 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
            <div className="w-full space-y-7">
              <div>
                <h3 className={`${epilogue.className} text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-2.5`}>About this Role</h3>
                <p className={`${epilogue.className} text-xs text-neutral-600 leading-relaxed font-normal text-justify`}>
                  {job.description}
                </p>
              </div>

              <div className="border-t border-neutral-100 pt-5">
                <h3 className={`${epilogue.className} text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-3`}>
                  Key Responsibilities
                </h3>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-neutral-600 leading-relaxed text-justify">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className={epilogue.className}>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-neutral-100 pt-5">
                <h3 className={`${epilogue.className} text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-3`}>
                  Qualifications
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex gap-2 text-xs text-neutral-600 leading-relaxed text-justify">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className={epilogue.className}>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-neutral-100 pt-5">
                <h3 className={`${epilogue.className} text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-3`}>
                  Compensation & Perks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, idx) => (
                    <div key={idx} className={`${epilogue.className} flex gap-2 items-start p-3 bg-neutral-50 border border-neutral-100 rounded-lg text-xs text-neutral-600 font-medium text-justify`}>
                      <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-5 bg-neutral-50 border-t-2 border-neutral-100 rounded-b-[10px] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className={`${epilogue.className} text-xs font-medium`}>
              {hasApplied ? (
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  You've already applied
                </span>
              ) : (
                <span className="text-neutral-400 uppercase">Open for applications</span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                id="close-modal-bottom-btn"
                onClick={onClose}
                className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-emerald-950 bg-amber-400 hover:bg-amber-300 text-neutral-900 text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none`}
              >
                Close
              </button>
              {!hasApplied && (
                <button
                  id="apply-modal-btn"
                  onClick={handleOneClickApply}
                  disabled={isApplying || !userProfile}
                  className={`${epilogue.className} inline-flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-emerald-950 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-[4px_4px_0px_0px_#022c22] transition-all duration-150 hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-[4px_4px_0px_0px_#022c22]`}                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      Apply Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
