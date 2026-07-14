import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, DollarSign, Briefcase, Award, CheckCircle2, ChevronRight, FileText, Sparkles, Loader2, Star } from 'lucide-react';
import { Job, UserProfile } from '@/components/landing/types';

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
          className="relative bg-white border border-neutral-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-neutral-100 bg-white sticky top-0 z-20">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-neutral-400">
                {job.department}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-950 mt-1 leading-snug tracking-tight">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {job.location}
                </span>
              </div>
            </div>

            <button
              id="close-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-neutral-100 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-neutral-50/10">        
            <div className="w-full space-y-8">
                <div>
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2.5">About this Role</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed font-normal text-justify">
                    {job.description}
                    </p>
                </div>

                <div className="border-t border-neutral-100 pt-5">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    Key Responsibilities
                    </h3>
                    <ul className="space-y-2">
                    {job.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-neutral-600 leading-relaxed text-justify">
                        <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <span>{resp}</span>
                        </li>
                    ))}
                    </ul>
                </div>

                <div className="border-t border-neutral-100 pt-5">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    Candidate Qualifications
                    </h3>
                    <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-neutral-600 leading-relaxed text-justify">
                        <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                        </li>
                    ))}
                    </ul>
                </div>

                <div className="border-t border-neutral-100 pt-5">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    Compensation & Perks
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex gap-2 items-start p-2.5 bg-white border border-neutral-100 rounded-lg text-xs text-neutral-600 font-medium text-justify shadow-2xs">
                        <Star className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </div>

          {/* Footer */}
          <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
            <button
              id="close-modal-bottom-btn"
              onClick={onClose}
              className="px-5 py-2 border border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 rounded-lg text-sm font-semibold bg-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}