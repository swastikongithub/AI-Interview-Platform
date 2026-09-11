import React from 'react';
import {
  Users,
  Calendar,
  CheckSquare,
  Video,
  FileText,
  Clock,
} from 'lucide-react';

export const InterviewerDashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Interviewer Header */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 md:p-10 shadow-2xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-elevated border border-border text-accent text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Interviewer Portal • Phase 0 Foundation</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            Interviewer Console
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Review assigned candidate profiles, conduct live or mock interviews, and submit structured evaluation reports.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Assigned Interviews</p>
            <p className="text-2xl font-extrabold text-white">0</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Live Video Mode</p>
            <p className="text-2xl font-extrabold text-white">Phase 5</p>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Completed Reports</p>
            <p className="text-2xl font-extrabold text-white">0</p>
          </div>
        </div>
      </div>

      {/* Empty State: Upcoming Assigned Interviews */}
      <div className="glass-card p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <span>Upcoming Assigned Interviews</span>
          </h2>
          <p className="text-xs text-slate-400">
            Your technical and HR interviews will appear here with links to candidate profiles and rubrics.
          </p>
        </div>

        <div className="border border-dashed border-border rounded-3xl p-12 text-center space-y-4 bg-surface/40">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted mx-auto shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-white">
            No interviews currently assigned
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Once recruiters schedule candidates with you, you will see their ATS score, resume, and structured rubric here.
          </p>
        </div>
      </div>
    </div>
  );
};

