import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  Plus,
  FileText,
  Search,
  CheckCircle,
  Building2,
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Recruiter Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 md:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-elevated border border-border text-accent text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Recruiter Portal • Phase 0 Foundation</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Recruiter Dashboard
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Post technical jobs, track applicants through kanban pipelines, and view AI-evaluated interview transcripts.
            </p>
          </div>

          <button
            onClick={() => alert('Job Posting & Applicant Kanban Pipeline unlock in Phase 4!')}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-all shadow-lg hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job (Phase 4)</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Active Companies</p>
            <p className="text-2xl font-extrabold text-white">1 (Demo)</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Open Job Postings</p>
            <p className="text-2xl font-extrabold text-white">0</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Applicant Pipeline</p>
            <p className="text-2xl font-extrabold text-white">0</p>
          </div>
        </div>
      </div>

      {/* Empty State: Active Job Postings */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent" />
              <span>Active Job Postings</span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage listings, review AI candidate ATS compatibility scores, and schedule interviews.
            </p>
          </div>
        </div>

        <div className="border border-dashed border-border rounded-3xl p-12 text-center space-y-4 bg-surface/40">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted mx-auto shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-white">
              No active job postings yet
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              In Phase 4, you'll be able to create jobs from JD text, auto-generate interview rubrics with Gemini, and manage candidate pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

