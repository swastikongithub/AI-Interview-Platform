import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { PageTransition } from '../../motion/PageTransition';
import { Reveal } from '../../motion/Reveal';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Evaluation } from '../../types';

export const InterviewEvaluation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: evaluation, isLoading, error } = useQuery<Evaluation>({
    queryKey: ['evaluation', id],
    queryFn: () => apiService.getEvaluation(id!),
    enabled: !!id,
    retry: false, // 404 is expected if pending
  });

  if (isLoading) {
    return (
      <PageTransition className="font-sans min-h-screen pb-32 pt-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <span className="font-mono text-xs uppercase tracking-widest text-ink-muted animate-pulse">Retrieving Dossier...</span>
      </PageTransition>
    );
  }

  // Handle case where evaluation doesn't exist yet or is restricted by RLS/Backend
  if (error || !evaluation) {
    return (
      <PageTransition className="font-sans min-h-screen pb-32 pt-32">
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto">
          <button 
            onClick={() => navigate('/candidate/interviews')}
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-ink-muted hover:text-ink transition-colors mb-12"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Directory</span>
          </button>
          
          <div className="py-32 border border-line bg-paper-raised relative overflow-hidden group flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center border border-line mb-6">
              <FileText className="w-6 h-6 text-ink-muted" />
            </div>
            <div className="relative z-10 space-y-4 px-6">
              <h2 className="text-3xl font-serif text-ink">Evaluation Pending</h2>
              <p className="text-sm font-sans text-ink-muted max-w-sm mx-auto leading-relaxed">
                The session has concluded, but the evaluation report is not yet available or is still processing.
              </p>
            </div>
          </div>
        </section>
      </PageTransition>
    );
  }

  if (evaluation.status === 'failed') {
    return (
      <PageTransition className="font-sans min-h-screen pb-32 pt-32">
        <section className="px-6 md:px-12 max-w-[1400px] mx-auto">
          <button 
            onClick={() => navigate('/candidate/interviews')}
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-ink-muted hover:text-ink transition-colors mb-12"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to Directory</span>
          </button>
          
          <div className="py-20 border border-red-500/20 bg-red-500/5 flex flex-col items-center text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-serif text-red-500 mb-2">Processing Error</h2>
            <p className="text-sm font-sans text-red-500/80 max-w-md">
              There was a failure generating the evaluation for this assessment. Support has been notified.
            </p>
          </div>
        </section>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="font-sans min-h-screen pb-32">
      <section className="relative px-6 md:px-12 pt-32 pb-16 max-w-[1400px] mx-auto border-b border-line">
        <button 
          onClick={() => navigate('/candidate/interviews')}
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-ink-muted hover:text-ink transition-colors mb-12"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Directory</span>
        </button>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-accent border-b border-line pb-1">
              Final Assessment
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 border border-green-500/20 rounded-full font-mono text-[10px] uppercase tracking-widest">
              <CheckCircle className="w-3 h-3" />
              <span>Completed</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tight">
            <MaskedTextReveal text="Evaluation Report" delay={0.1} />
          </h1>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Content */}
          <main className="lg:col-span-8 space-y-16">
            <Reveal delay={0.3} y={20} className="space-y-8 border border-line p-8 md:p-12 bg-paper-raised">
              <h2 className="font-mono text-xs text-ink-faint uppercase tracking-widest border-b border-line pb-4">
                Executive Summary
              </h2>
              <div className="prose prose-p:text-ink prose-p:font-sans prose-p:leading-relaxed max-w-none">
                <p>{evaluation.summary || 'No summary provided.'}</p>
              </div>
            </Reveal>

            <Reveal delay={0.4} y={20} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Strengths */}
                <div className="p-8 border border-line bg-paper">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-ink mb-6 border-b border-line pb-4">
                    Key Strengths
                  </h3>
                  <ul className="space-y-4">
                    {evaluation.strengths && Array.isArray(evaluation.strengths) ? (
                      evaluation.strengths.map((str: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start text-sm font-sans text-ink-muted">
                          <span className="text-accent mt-1">✦</span>
                          <span>{str}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm font-sans text-ink-faint italic">No structured data</li>
                    )}
                  </ul>
                </div>

                {/* Areas for Growth */}
                <div className="p-8 border border-line bg-paper">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-ink mb-6 border-b border-line pb-4">
                    Growth Areas
                  </h3>
                  <ul className="space-y-4">
                    {evaluation.weaknesses && Array.isArray(evaluation.weaknesses) ? (
                      evaluation.weaknesses.map((weak: string, i: number) => (
                        <li key={i} className="flex gap-4 items-start text-sm font-sans text-ink-muted">
                          <span className="text-red-400 mt-1">✦</span>
                          <span>{weak}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm font-sans text-ink-faint italic">No structured data</li>
                    )}
                  </ul>
                </div>
              </div>
            </Reveal>
          </main>
          
          {/* Metrics Sidebar */}
          <aside className="lg:col-span-4">
            <Reveal delay={0.5} y={20} className="sticky top-32 space-y-8 p-8 border border-line bg-paper">
              <h3 className="font-mono text-xs text-ink uppercase tracking-widest border-b border-line pb-4">
                Quantitative Metrics
              </h3>
              
              <div className="space-y-6">
                {[
                  { label: 'Technical Accuracy', score: evaluation.technical_score },
                  { label: 'Communication', score: evaluation.communication_score },
                  { label: 'Coding Standards', score: evaluation.coding_score },
                  { label: 'Confidence', score: evaluation.confidence_score },
                ].map((metric) => (
                  <div key={metric.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-sans text-ink-muted">{metric.label}</span>
                      <span className="font-mono text-sm text-ink">{metric.score} / 100</span>
                    </div>
                    <div className="w-full h-1 bg-paper-pressed overflow-hidden">
                      <div 
                        className="h-full bg-accent transition-all duration-1000 ease-out"
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {evaluation.overall_score !== null && (
                <div className="pt-8 mt-8 border-t border-line text-center">
                  <span className="text-xs font-mono uppercase tracking-widest text-ink-faint block mb-2">Overall Synthesis</span>
                  <div className="text-6xl font-serif text-ink tracking-tight leading-none">
                    {evaluation.overall_score}
                  </div>
                </div>
              )}
            </Reveal>
          </aside>
          
        </div>
      </section>
    </PageTransition>
  );
};
