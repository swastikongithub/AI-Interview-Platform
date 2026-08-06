import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  User,
  Award,
  Code2,
  Calendar,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { profile, user } = useAuth();

  const skillsCount = profile?.skills?.length || 0;
  const isProfileComplete = Boolean(
    profile?.name && profile?.skills?.length > 0 && profile?.education?.length > 0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 md:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-elevated border border-border text-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Candidate Portal • Phase 0 Foundation</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
              Welcome back,{' '}
              <span className="gradient-text">{profile?.name || user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Prepare for technical interviews, practice coding challenges against Judge0, and track your ATS match scores.
            </p>
          </div>

          <Link
            to="/candidate/profile"
            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-surface-elevated hover:bg-accent hover:text-white text-white font-semibold text-sm border border-border transition-all duration-200 hover:scale-[1.02] shadow-lg group"
          >
            <div className="w-6 h-6 rounded-full bg-white text-surface flex items-center justify-center group-hover:bg-white group-hover:text-accent transition-colors">
              <User className="w-3.5 h-3.5" />
            </div>
            <span>Manage My Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Completeness Card */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
              <User className="w-6 h-6" />
            </div>
            {isProfileComplete ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                Incomplete
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Candidate Profile</h3>
            <p className="text-xs text-slate-400 mt-1">
              {skillsCount} verified technical skills added. Education & experience records active.
            </p>
          </div>
          <Link
            to="/candidate/profile"
            className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1.5 mt-2 transition-colors"
          >
            <span>Edit profile & skills</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ATS Score Preview Card */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400">Phase 1 Preview</span>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {profile?.ats_score || 85}
              </span>
              <span className="text-xs text-slate-400">/ 100 ATS Score</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Baseline profile strength rating. Resume PDF upload and Gemini keyword analysis unlock in Phase 1.
            </p>
          </div>
          <div className="w-full bg-surface-elevated border border-border rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-accent via-amber-400 to-accent-hover h-full rounded-full"
              style={{ width: `${profile?.ats_score || 85}%` }}
            />
          </div>
        </div>

        {/* Coding & Interviews Card */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
              <Code2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-400">Phase 2 & 3</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Practice & Mock Interviews</h3>
            <p className="text-xs text-slate-400 mt-1">
              Adaptive AI text interviews & Judge0 coding sandbox are scheduled for upcoming increments.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[11px] px-3 py-1.5 rounded-full bg-surface-elevated border border-border text-slate-300 font-semibold">
              0 Active Submissions
            </span>
            <span className="text-[11px] px-3 py-1.5 rounded-full bg-surface-elevated border border-border text-slate-300 font-semibold">
              0 Scheduled
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews & Activity Section */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-accent" />
              <span>Upcoming Interviews & Activity</span>
            </h2>
            <p className="text-xs text-slate-400">
              No live or mock interviews scheduled yet.
            </p>
          </div>
        </div>

        <div className="border border-dashed border-border rounded-3xl p-10 text-center space-y-3 bg-surface/40">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted mx-auto shadow-inner">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-white">
            You have no upcoming scheduled interviews
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When you apply to jobs or start an AI practice interview in Phase 2, your scheduled sessions will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

