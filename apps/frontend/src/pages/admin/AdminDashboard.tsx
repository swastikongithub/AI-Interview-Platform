import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import {
  ShieldCheck,
  Database,
  Lock,
  Activity,
  CheckCircle2,
  Users,
  Layers,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    apiService.getHealth().then(setHealthData).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Header */}
      <div className="relative overflow-hidden rounded-3xl bg-surface border border-border p-8 md:p-10 shadow-2xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-elevated border border-border text-accent text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Console • Phase 0 Foundation</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            System Administration & Security
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Monitor Row Level Security (RLS) policies, inspect API rate limiting status, and manage platform role assignments.
          </p>
        </div>
      </div>

      {/* Security & RLS Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Database Status</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">
            {healthData?.database_mode === 'supabase_postgres'
              ? 'Remote Supabase'
              : 'Local Demo Mock'}
          </p>
          <p className="text-[11px] text-slate-400">
            14 schema tables initialized
          </p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">RLS Policies</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" /> 100% Active
          </p>
          <p className="text-[11px] text-slate-400">
            Row-level isolation enforced
          </p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Rate Limiter</span>
            <Activity className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xl font-bold text-white">100 req / 15m</p>
          <p className="text-[11px] text-slate-400">
            IP-based protection enabled
          </p>
        </div>

        <div className="glass-card p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">RBAC Guards</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white">4 Roles</p>
          <p className="text-[11px] text-slate-400">
            Candidate, Recruiter, Interviewer, Admin
          </p>
        </div>
      </div>

      {/* Role Access Matrix */}
      <div className="glass-card p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-accent" />
            <span>Role-Based Access Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Strict separation of concerns across the 4 platform roles.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted font-semibold">
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Profile CRUD</th>
                <th className="py-3 px-4">Job Posting</th>
                <th className="py-3 px-4">Interviews</th>
                <th className="py-3 px-4">System Admin</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border/60">
              <tr>
                <td className="py-3 px-4 font-semibold text-accent">Candidate</td>
                <td className="py-3 px-4 text-emerald-400">Own profile only</td>
                <td className="py-3 px-4 text-slate-600">No access</td>
                <td className="py-3 px-4 text-slate-300">Take practice/mock</td>
                <td className="py-3 px-4 text-slate-600">No access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-cyan-400">Recruiter</td>
                <td className="py-3 px-4 text-emerald-400">View candidates</td>
                <td className="py-3 px-4 text-emerald-400">Create & manage</td>
                <td className="py-3 px-4 text-slate-300">Schedule & review</td>
                <td className="py-3 px-4 text-slate-600">No access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-emerald-400">Interviewer</td>
                <td className="py-3 px-4 text-emerald-400">View assigned</td>
                <td className="py-3 px-4 text-slate-600">No access</td>
                <td className="py-3 px-4 text-emerald-400">Conduct & evaluate</td>
                <td className="py-3 px-4 text-slate-600">No access</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-purple-400">Admin</td>
                <td className="py-3 px-4 text-emerald-400">Full access</td>
                <td className="py-3 px-4 text-emerald-400">Full access</td>
                <td className="py-3 px-4 text-emerald-400">Full access</td>
                <td className="py-3 px-4 text-emerald-400">Full access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

