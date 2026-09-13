import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { ATSReport } from '../../types';
import { Reveal } from '../../motion/Reveal';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { SectionTransition } from '../../motion/SectionTransition';
import { UploadCloud, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ResumeUploaderProps {
  onProfileUpdated?: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onProfileUpdated }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: statusData } = useQuery({
    queryKey: ['resumeStatus'],
    queryFn: () => apiService.getResumeStatus(),
    refetchInterval: (query) => {
      const status = query.state?.data?.resume_status;
      return status === 'processing' ? 2000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => apiService.uploadResume(file),
    onSuccess: () => {
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['resumeStatus'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      if (onProfileUpdated) onProfileUpdated();
    },
    onError: (err: unknown) => {
      const error = err as any;
      setUploadError(
        error?.response?.data?.error || error.message || 'Failed to upload PDF resume file'
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type !== 'application/pdf') {
        setUploadError('Please select a valid PDF file (.pdf)');
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const currentStatus = statusData?.resume_status || 'none';
  const atsReport: ATSReport | null = statusData?.ats_report || null;

  return (
    <div className="space-y-16">
      <div className="border-b border-line pb-6">
        <h2 className="text-4xl font-serif text-ink tracking-tight mb-2">
          <MaskedTextReveal text="ATS Telemetry" delay={0.2} />
        </h2>
        <Reveal delay={0.4}>
          <p className="text-lg font-sans text-ink-muted font-light">
            Upload your document for analytical breakdown and automated dossier population.
          </p>
        </Reveal>
      </div>

      <SectionTransition>
        <div
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
          onDrop={(e) => {
            e.preventDefault(); e.stopPropagation(); setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const file = e.dataTransfer.files[0];
              if (file.type !== 'application/pdf') {
                setUploadError('Please select a valid PDF file (.pdf)');
                return;
              }
              uploadMutation.mutate(file);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border border-line rounded-sm p-12 text-center cursor-pointer transition-all duration-300 group overflow-hidden ${
            dragActive ? 'bg-accent/5 border-accent' : 'bg-paper-raised hover:border-ink-muted'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
              dragActive ? 'bg-accent text-white' : 'bg-paper border border-line text-ink-muted group-hover:text-ink'
            }`}>
              <UploadCloud className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-lg font-serif text-ink mb-2">
                {uploadMutation.isPending ? 'Ingesting Document...' : 'Initialize Dossier Extraction'}
              </p>
              <p className="text-sm font-sans text-ink-faint max-w-md mx-auto">
                Drop a text-readable PDF resume here to execute the ATS extraction sequence.
              </p>
            </div>
          </div>
        </div>
      </SectionTransition>

      {uploadError && (
        <SectionTransition>
          <div className="p-6 bg-critical/5 border border-critical/20 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-critical shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-bold text-critical font-mono uppercase tracking-widest mb-1">Extraction Failure</p>
              <p className="text-sm font-sans text-critical/80">{uploadError}</p>
            </div>
          </div>
        </SectionTransition>
      )}

      {currentStatus === 'processing' && (
        <SectionTransition>
          <div className="p-8 border border-line bg-paper-raised flex items-center gap-6">
            <div className="w-12 h-12 relative flex items-center justify-center">
              <div className="absolute inset-0 border border-accent/20 rounded-full animate-ping" />
              <div className="w-4 h-4 bg-accent rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-serif text-ink mb-1">Executing Analysis Sequence</p>
              <p className="text-sm font-mono text-ink-faint uppercase tracking-widest">Awaiting Analysis...</p>
            </div>
          </div>
        </SectionTransition>
      )}

      {currentStatus === 'complete' && atsReport && (
        <div className="space-y-24 border-t border-line pt-16 mt-16">
          <Reveal y={40} delay={0.1}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-line">
              <div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-accent mb-4 block">Analysis Complete</span>
                <h3 className="text-3xl font-serif text-ink tracking-tight">Systematic ATS Evaluation</h3>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-serif text-ink tracking-tight leading-none">{atsReport.score}</span>
                <span className="text-sm font-mono uppercase tracking-widest text-ink-faint">/ 100 Base</span>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Missing Keywords */}
            {(atsReport.missing_keywords || []).length > 0 && (
              <Reveal y={30} delay={0.2} className="space-y-6">
                <h4 className="font-mono text-xs text-ink uppercase tracking-widest border-b border-line pb-2">Target Vocabulary Delta</h4>
                <div className="flex flex-wrap gap-2">
                  {atsReport.missing_keywords!.map((kw, idx) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-sm bg-critical/5 border border-critical/20 text-critical font-mono text-xs uppercase tracking-widest">
                      Missing: {kw}
                    </span>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Grammar / Formatting */}
            {(atsReport.grammar_notes || []).length > 0 && (
              <Reveal y={30} delay={0.3} className="space-y-6">
                <h4 className="font-mono text-xs text-ink uppercase tracking-widest border-b border-line pb-2">Structural Fidelity</h4>
                <ul className="space-y-4">
                  {atsReport.grammar_notes!.map((note, idx) => (
                    <li key={idx} className="flex gap-4 text-sm font-sans text-ink-muted leading-relaxed">
                      <span className="font-mono text-ink-faint mt-1">0{idx + 1}</span>
                      <p>{note}</p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {/* Recommendations */}
            {(atsReport.improvement_suggestions || []).length > 0 && (
              <Reveal y={30} delay={0.4} className="md:col-span-2 space-y-6 pt-8 border-t border-line">
                <h4 className="font-mono text-xs text-ink uppercase tracking-widest border-b border-line pb-2">Actionable Directives</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {atsReport.improvement_suggestions!.map((sug, idx) => (
                    <div key={idx} className="p-6 bg-paper-raised border border-line space-y-3">
                      <CheckCircle2 className="w-4 h-4 text-accent" strokeWidth={2} />
                      <p className="text-sm font-sans text-ink leading-relaxed">{sug}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
