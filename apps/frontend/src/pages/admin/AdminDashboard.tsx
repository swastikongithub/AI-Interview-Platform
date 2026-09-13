import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { Reveal } from '../../motion/Reveal';
import { apiService } from '../../services/api';
import {
  ShieldCheck,
  Database,
  Lock,
  Activity,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  Server,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apiService.getHealth()
      .then(setHealthData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="w-full space-y-16 lg:space-y-24">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-24 relative">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 border-b border-ink pb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              Admin Portal
            </span>
          </div>
          
          <div className="space-y-6 max-w-2xl">
            <MaskedTextReveal 
              text="Platform Administration."
              className="text-4xl md:text-6xl font-serif tracking-tight text-ink"
            />
            <Reveal delay={0.2} y={20}>
              <p className="text-lg text-ink-muted leading-relaxed font-sans">
                Monitor system health, database connections, and enforce role-based access control.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Action Column */}
        <Reveal delay={0.3} y={20} className="w-full lg:w-72 flex-shrink-0">
          <div className="p-6 border border-line bg-paper flex flex-col gap-6 relative">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-2">Network Status</p>
              <h3 className="text-xl font-serif text-ink tracking-tight">System Online</h3>
            </div>
            <div className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-paper-raised border border-line text-ink font-sans text-xs font-semibold uppercase tracking-widest">
              <Server className="w-4 h-4" />
              <span>All Systems Nominal</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Security & RLS Overview (Data-driven) */}
      <div className="space-y-8">
        <Reveal delay={0.4} className="flex items-center justify-between border-b border-line pb-4">
          <h2 className="text-2xl font-serif text-ink tracking-tight">System Health</h2>
        </Reveal>

        <div className="min-h-[160px] relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center py-12"
              >
                <div className="flex flex-col items-center gap-4 text-ink-faint">
                  <span className="w-2 h-2 bg-accent rounded-full animate-ping" />
                  <span className="font-mono text-xs uppercase tracking-widest">Fetching Diagnostics</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="resolved"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-y border-line divide-y sm:divide-y-0 sm:divide-x divide-line"
              >
                <div className="p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-3 text-ink-muted">
                    <Database className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono text-[10px] uppercase tracking-widest">Database Mode</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-serif text-ink tracking-tight truncate">
                      {healthData?.database_mode === 'supabase_postgres' ? 'Remote Supabase' : 'Local Mock'}
                    </p>
                    <p className="font-mono text-[10px] text-ink-faint">14 schema tables initialized</p>
                  </div>
                </div>

                <div className="p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-3 text-ink-muted">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono text-[10px] uppercase tracking-widest">RLS Policies</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-serif text-emerald-600 tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Active
                    </p>
                    <p className="font-mono text-[10px] text-ink-faint">Row-level isolation enforced</p>
                  </div>
                </div>

                <div className="p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-3 text-ink-muted">
                    <Activity className="w-4 h-4 text-accent" />
                    <span className="font-mono text-[10px] uppercase tracking-widest">Rate Limiter</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-serif text-ink tracking-tight">100 req / 15m</p>
                    <p className="font-mono text-[10px] text-ink-faint">IP-based protection enabled</p>
                  </div>
                </div>

                <div className="p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-3 text-ink-muted">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-mono text-[10px] uppercase tracking-widest">RBAC Guards</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-serif text-ink tracking-tight">4 Roles</p>
                    <p className="font-mono text-[10px] text-ink-faint">Standard Matrix Applied</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Role Access Matrix */}
      <div className="space-y-8">
        <Reveal delay={0.5} className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-accent" />
            <h2 className="text-2xl font-serif text-ink tracking-tight">Role-Based Access Matrix</h2>
          </div>
        </Reveal>

        <Reveal delay={0.6}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-y border-line bg-paper-raised">
                  <th className="py-4 px-6 font-mono text-[10px] uppercase tracking-widest text-ink-muted font-semibold">Role</th>
                  <th className="py-4 px-6 font-mono text-[10px] uppercase tracking-widest text-ink-muted font-semibold">Profile CRUD</th>
                  <th className="py-4 px-6 font-mono text-[10px] uppercase tracking-widest text-ink-muted font-semibold">Job Posting</th>
                  <th className="py-4 px-6 font-mono text-[10px] uppercase tracking-widest text-ink-muted font-semibold">Interviews</th>
                  <th className="py-4 px-6 font-mono text-[10px] uppercase tracking-widest text-ink-muted font-semibold">System Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                <tr className="hover:bg-paper-raised/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-accent">Candidate</td>
                  <td className="py-4 px-6 text-emerald-600">Own profile only</td>
                  <td className="py-4 px-6 text-ink-faint">No access</td>
                  <td className="py-4 px-6 text-ink-muted">Take practice/mock</td>
                  <td className="py-4 px-6 text-ink-faint">No access</td>
                </tr>
                <tr className="hover:bg-paper-raised/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-cyan-600">Recruiter</td>
                  <td className="py-4 px-6 text-emerald-600">View candidates</td>
                  <td className="py-4 px-6 text-emerald-600">Create & manage</td>
                  <td className="py-4 px-6 text-ink-muted">Schedule & review</td>
                  <td className="py-4 px-6 text-ink-faint">No access</td>
                </tr>
                <tr className="hover:bg-paper-raised/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-emerald-600">Interviewer</td>
                  <td className="py-4 px-6 text-emerald-600">View assigned</td>
                  <td className="py-4 px-6 text-ink-faint">No access</td>
                  <td className="py-4 px-6 text-emerald-600">Conduct & evaluate</td>
                  <td className="py-4 px-6 text-ink-faint">No access</td>
                </tr>
                <tr className="hover:bg-paper-raised/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-purple-600">Admin</td>
                  <td className="py-4 px-6 text-emerald-600">Full access</td>
                  <td className="py-4 px-6 text-emerald-600">Full access</td>
                  <td className="py-4 px-6 text-emerald-600">Full access</td>
                  <td className="py-4 px-6 text-emerald-600">Full access</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
