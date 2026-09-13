import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight } from 'lucide-react';
import { PageTransition } from '../../motion/PageTransition';
import { Reveal } from '../../motion/Reveal';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { Parallax } from '../../motion/Parallax';
import { ImageReveal } from '../../motion/ImageReveal';
import { ScrollProgress } from '../../motion/ScrollProgress';
import { Badge } from '../../components/common/Badge';

export const CandidateDashboard: React.FC = () => {
  const { profile, user } = useAuth();

  const skillsCount = profile?.skills?.length || 0;
  const isProfileComplete = Boolean(
    profile?.name && (profile?.skills?.length ?? 0) > 0 && (profile?.education?.length ?? 0) > 0
  );

  return (
    <PageTransition className="font-sans min-h-screen pb-32">
      <ScrollProgress />
      
      {/* Cinematic Hero Section */}
      <section className="relative px-6 md:px-12 pt-32 pb-24 max-w-[1400px] mx-auto border-b border-line">
        <Parallax offset={40} className="max-w-4xl">
          <span className="font-mono text-[10px] tracking-widest uppercase text-accent border-b border-line pb-1 mb-8 inline-block">
            Candidate Portal
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tight mb-8">
            <MaskedTextReveal text={`Welcome back, ${profile?.name || user?.email?.split('@')[0] || 'Candidate'}.`} delay={0.1} />
          </h1>
          <Reveal delay={0.6} y={20}>
            <p className="text-xl md:text-2xl text-ink-muted font-sans font-light leading-relaxed max-w-2xl">
              Prepare for technical interviews, practice your communication skills, and track your analytical ATS capabilities.
            </p>
          </Reveal>
        </Parallax>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pt-24">
        <div className="flex flex-col lg:flex-row gap-16 md:gap-24">
          
          {/* Identity & Status Column (Left) */}
          <aside className="lg:w-1/3 lg:sticky lg:top-24 self-start space-y-16">
            <Reveal delay={0.7} y={30} className="space-y-12">
              {/* ATS Score Preview */}
              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint border-b border-line pb-2">
                  Analytical Baseline
                </h3>
                <div className="flex items-end gap-3 pt-2">
                  <span className="text-6xl font-serif text-ink tracking-tight leading-none">{profile?.ats_score || 85}</span>
                  <span className="text-sm font-sans text-ink-muted mb-1 uppercase tracking-widest font-mono">/ 100 ATS</span>
                </div>
              </div>

              {/* Completeness */}
              <div className="space-y-4">
                <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint border-b border-line pb-2">
                  Dossier Status
                </h3>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-sans text-ink">{skillsCount} Verified Skills</span>
                  <Badge variant={isProfileComplete ? 'success' : 'warning'}>
                    {isProfileComplete ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t border-line">
                <Link
                  to="/candidate/profile"
                  className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-accent hover:text-ink transition-colors group"
                >
                  <span>Access Dossier</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
          </aside>

          {/* Activity & Content Column (Right) */}
          <main className="lg:w-2/3 space-y-32">
            
            {/* Upcoming Interviews */}
            <Reveal delay={0.8} y={40} className="space-y-8">
              <div className="flex flex-col gap-2 border-b border-line pb-6">
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">Live Execution</span>
                <h2 className="text-4xl font-serif text-ink">Scheduled Activity</h2>
              </div>
              
              <div className="py-20 border border-line bg-paper-raised relative overflow-hidden group flex flex-col items-center justify-center text-center">
                {/* Subtle cinematic background abstract */}
                <div className="absolute inset-0 bg-gradient-to-br from-paper via-paper-raised to-paper-pressed opacity-50 transition-opacity group-hover:opacity-80" />
                <div className="relative z-10 space-y-4 px-6">
                  <p className="text-2xl font-serif text-ink">No active schedules</p>
                  <p className="text-sm font-sans text-ink-muted max-w-sm mx-auto leading-relaxed">
                    When you apply to jobs or start an AI practice interview, your scheduled evaluation sessions will be indexed here.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Active Practice */}
            <Reveal delay={0.9} y={40} className="space-y-8">
              <div className="flex flex-col gap-2 border-b border-line pb-6">
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">Asynchronous Sandbox</span>
                <h2 className="text-4xl font-serif text-ink">Technical Practice</h2>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <Link
                  to="/candidate/interviews"
                  className="p-8 border border-line bg-paper-raised hover:bg-paper-pressed transition-colors space-y-6 flex flex-col justify-between min-h-[240px] group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs text-ink-faint uppercase tracking-widest mb-3 block border-b border-line pb-2 inline-block">Adaptive Text</span>
                      <p className="text-sm text-ink-muted font-sans leading-relaxed">Behavioral & Technical interview preparation.</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-accent group-hover:translate-x-2 transition-transform" />
                  </div>
                  <div>
                    <p className="text-lg font-serif text-ink tracking-tight mb-2 group-hover:text-accent transition-colors">Access Interview Dossier</p>
                    <p className="text-xs font-mono uppercase tracking-widest text-ink-faint">View all your sessions</p>
                  </div>
                </Link>
              </div>
            </Reveal>

          </main>

        </div>
      </section>
    </PageTransition>
  );
};
