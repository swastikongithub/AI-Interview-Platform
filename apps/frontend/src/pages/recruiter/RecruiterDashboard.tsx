import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { Reveal } from '../../motion/Reveal';
import {
  Briefcase,
  Users,
  Plus,
  FileText,
  Building2,
  Sparkles,
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { user, profile } = useAuth();

  return (
    <div className="w-full space-y-16 lg:space-y-24">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-24 relative">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 border-b border-ink pb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Recruiter Portal
            </span>
          </div>
          
          <div className="space-y-6 max-w-2xl">
            <MaskedTextReveal 
              text="Recruiting Operations."
              className="text-4xl md:text-6xl font-serif tracking-tight text-ink"
            />
            <Reveal delay={0.2} y={20}>
              <p className="text-lg text-ink-muted leading-relaxed font-sans">
                Manage job requisitions and track applicant progression.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Action Column */}
        <Reveal delay={0.3} y={20} className="w-full lg:w-72 flex-shrink-0">
          <div className="p-6 border border-line bg-paper-raised flex flex-col gap-6 relative group">
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-2">Primary Action</p>
              <h3 className="text-xl font-serif text-ink tracking-tight">New Requisition</h3>
            </div>
            <button
              onClick={() => alert('Post New Job feature coming soon.')}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-ink text-paper font-sans text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors relative z-10"
            >
              <Plus className="w-4 h-4" />
              <span>Post Job</span>
            </button>
          </div>
        </Reveal>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-y border-line divide-y md:divide-y-0 md:divide-x divide-line">
        <Reveal delay={0.4} className="p-8 md:p-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-ink-muted">
            <Building2 className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Active Companies</span>
          </div>
          <p className="text-5xl font-serif text-ink tracking-tight">0</p>
        </Reveal>

        <Reveal delay={0.5} className="p-8 md:p-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-ink-muted">
            <Briefcase className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Open Requisitions</span>
          </div>
          <p className="text-5xl font-serif text-ink tracking-tight">0</p>
        </Reveal>

        <Reveal delay={0.6} className="p-8 md:p-12 flex flex-col gap-6">
          <div className="flex items-center gap-3 text-ink-muted">
            <Users className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-widest">Active Applicants</span>
          </div>
          <p className="text-5xl font-serif text-ink tracking-tight">0</p>
        </Reveal>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-24">
        <div className="space-y-8">
          <Reveal delay={0.5} className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="text-2xl font-serif text-ink tracking-tight">Active Postings</h2>
          </Reveal>

          <Reveal delay={0.6}>
            <div className="border border-line bg-paper-raised p-12 md:p-24 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full border border-line flex items-center justify-center text-ink-faint">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-serif text-ink tracking-tight">No active requisitions</h3>
                <p className="text-sm font-sans text-ink-muted max-w-sm mx-auto leading-relaxed">
                  You have not published any job postings. Create a requisition to begin tracking applicants.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Sidebar Dossier */}
        <div className="space-y-8">
          <Reveal delay={0.7} className="border-b border-line pb-4">
            <h2 className="text-sm font-sans text-ink tracking-wide font-semibold">Recruiter Dossier</h2>
          </Reveal>
          
          <Reveal delay={0.8} className="space-y-6 font-mono text-[11px] text-ink-muted">
            <div className="flex flex-col gap-1 border-b border-line pb-4">
              <span className="uppercase tracking-widest text-ink-faint">Identity</span>
              <span className="text-ink">{profile?.name || user?.email || 'Unknown User'}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-line pb-4">
              <span className="uppercase tracking-widest text-ink-faint">System Role</span>
              <span className="text-ink">Recruiter</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-line pb-4">
              <span className="uppercase tracking-widest text-ink-faint">Pipeline Status</span>
              <span className="text-ink">Idle</span>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
};
