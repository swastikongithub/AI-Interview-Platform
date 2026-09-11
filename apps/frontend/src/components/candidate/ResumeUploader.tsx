import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { ATSReport } from '../../types';

interface ResumeUploaderProps {
  onProfileUpdated?: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onProfileUpdated }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Poll resume status while processing
  const { data: statusData, isLoading: isStatusLoading } = useQuery({
    queryKey: ['resumeStatus'],
    queryFn: () => apiService.getResumeStatus(),
    refetchInterval: (query) => {
      const status = query.state?.data?.resume_status;
      return status === 'processing' ? 2000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => apiService.uploadResume(file),
    onSuccess: (data) => {
      setUploadError(null);
      queryClient.invalidateQueries({ queryKey: ['resumeStatus'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    },
    onError: (err: any) => {
      setUploadError(
        err?.response?.data?.error || err.message || 'Failed to upload PDF resume file'
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
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
    <div className="bg-editorial-card border border-editorial-border rounded-editorial-lg p-6 shadow-editorial-card transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-outfit font-bold text-editorial-text-primary">
            AI Resume Analyzer & Auto-Fill
          </h3>
          <p className="text-sm font-inter text-editorial-text-secondary mt-1">
            Upload your PDF resume to auto-populate your profile and receive an instant ATS compatibility breakdown.
          </p>
        </div>
        {currentStatus === 'complete' && atsReport && (
          <div className="flex items-center gap-2 bg-editorial-accent-amber/10 border border-editorial-accent-amber/30 px-4 py-2 rounded-editorial-pill">
            <span className="text-xs font-inter uppercase tracking-wider text-editorial-accent-amber font-semibold">
              ATS Score
            </span>
            <span className="text-lg font-outfit font-bold text-editorial-accent-amber">
              {atsReport.score}/100
            </span>
          </div>
        )}
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-editorial-lg p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-editorial-accent-amber bg-editorial-accent-amber/5'
            : 'border-editorial-border hover:border-editorial-text-secondary bg-editorial-bg/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-editorial-border/30 flex items-center justify-center text-editorial-text-secondary">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-inter font-medium text-editorial-text-primary">
              {uploadMutation.isPending
                ? 'Uploading resume...'
                : 'Drop your PDF resume here, or click to browse'}
            </p>
            <p className="text-xs text-editorial-text-muted mt-1">
              Supports text-readable PDF documents up to 5MB. SHA-256 hash dedup enabled.
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-500/40 rounded-editorial text-sm text-red-300 font-inter">
          {uploadError}
        </div>
      )}

      {/* Processing State */}
      {currentStatus === 'processing' && (
        <div className="mt-6 p-4 bg-editorial-accent-amber/5 border border-editorial-accent-amber/20 rounded-editorial-lg flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-editorial-accent-amber border-t-transparent rounded-full" />
          <span className="text-sm font-inter text-editorial-text-primary">
            AI Engine Extracting Profile & Scoring Resume...
          </span>
        </div>
      )}

      {/* Failed Recovery State */}
      {currentStatus === 'failed' && (
        <div className="mt-6 p-4 bg-red-950/40 border border-red-500/40 rounded-editorial-lg">
          <p className="text-sm font-inter font-semibold text-red-300">
            Resume processing encountered an issue.
          </p>
          <p className="text-xs font-inter text-red-200/80 mt-1">
            Your existing manually entered profile fields remain untouched. Please retry uploading a text-readable PDF.
          </p>
        </div>
      )}

      {/* Completed ATS Report Breakdown */}
      {currentStatus === 'complete' && atsReport && (
        <div className="mt-6 space-y-4 border-t border-editorial-border pt-6">
          <h4 className="text-sm font-outfit uppercase tracking-wider text-editorial-text-secondary font-semibold">
            ATS Compatibility Breakdown
          </h4>

          {/* Missing Keywords */}
          {atsReport.missing_keywords && atsReport.missing_keywords.length > 0 && (
            <div>
              <p className="text-xs font-inter text-editorial-text-muted mb-2">
                Suggested Missing Keywords:
              </p>
              <div className="flex flex-wrap gap-2">
                {atsReport.missing_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-editorial-pill text-xs font-inter font-medium bg-red-500/10 text-red-300 border border-red-500/20"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Grammar & Structural Notes */}
          {atsReport.grammar_notes && atsReport.grammar_notes.length > 0 && (
            <div>
              <p className="text-xs font-inter text-editorial-text-muted mb-1">
                Grammar & Formatting Notes:
              </p>
              <ul className="list-disc list-inside text-xs font-inter text-editorial-text-secondary space-y-1">
                {atsReport.grammar_notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement Suggestions */}
          {atsReport.improvement_suggestions && atsReport.improvement_suggestions.length > 0 && (
            <div>
              <p className="text-xs font-inter text-editorial-text-muted mb-1">
                Actionable Improvement Suggestions:
              </p>
              <ul className="list-disc list-inside text-xs font-inter text-editorial-text-secondary space-y-1">
                {atsReport.improvement_suggestions.map((sug, idx) => (
                  <li key={idx}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
