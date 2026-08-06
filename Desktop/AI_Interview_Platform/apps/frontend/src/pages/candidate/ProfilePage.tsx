import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { CandidateProfile, EducationItem, ExperienceItem } from '../../types';
import { ResumeUploader } from '../../components/candidate/ResumeUploader';
import { JobRecommendations } from '../../components/candidate/JobRecommendations';

import {
  User,
  Plus,
  Trash2,
  Save,
  Check,
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  Briefcase,
  Code2,
  AlertCircle,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({
    name: '',
    skills: [],
    education: [],
    experience: [],
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        skills: profile.skills || [],
        education: profile.education || [],
        experience: profile.experience || [],
        github_url: profile.github_url || '',
        linkedin_url: profile.linkedin_url || '',
        portfolio_url: profile.portfolio_url || '',
      });
    }
  }, [profile]);

  // Skills handlers
  const addSkill = () => {
    if (!newSkill.trim()) return;
    const current = formData.skills || [];
    if (!current.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...current, newSkill.trim()] });
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter((s) => s !== skillToRemove),
    });
  };

  // Education handlers
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...(formData.education || []),
        { institution: '', degree: '', year: '' },
      ],
    });
  };

  const updateEducation = (index: number, key: keyof EducationItem, value: string) => {
    const updated = [...(formData.education || [])];
    updated[index] = { ...updated[index], [key]: value };
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (index: number) => {
    const updated = [...(formData.education || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, education: updated });
  };

  // Experience handlers
  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...(formData.experience || []),
        { company: '', role: '', duration: '', description: '' },
      ],
    });
  };

  const updateExperience = (
    index: number,
    key: keyof ExperienceItem,
    value: string
  ) => {
    const updated = [...(formData.experience || [])];
    updated[index] = { ...updated[index], [key]: value };
    setFormData({ ...formData, experience: updated });
  };

  const removeExperience = (index: number) => {
    const updated = [...(formData.experience || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, experience: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      await apiService.updateMyProfile(formData);
      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setErrorMessage(
        err.response?.data?.error || 'Failed to update profile. Check your input URLs and format.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <User className="w-7 h-7 text-accent" />
            <span>Candidate Profile Management</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manually enter your background, skills, and links. (Resume PDF ATS parsing unlocks in Phase 1).
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-danger/15 border border-danger/30 flex items-center gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-success/15 border border-success/30 flex items-center gap-3 text-emerald-300 text-sm animate-in fade-in">
          <Check className="w-5 h-5 shrink-0" />
          <span>Profile saved successfully! Your changes are live across all role dashboards.</span>
        </div>
      )}

      <ResumeUploader onProfileUpdated={refreshProfile} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2.5 border-b border-border pb-3">
            <User className="w-5 h-5 text-accent" />
            <span>Basic Information & Socials</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alex Candidate"
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5 text-slate-400" /> GitHub URL
              </label>
              <input
                type="url"
                value={formData.github_url || ''}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-slate-400" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url || ''}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Portfolio Website
              </label>
              <input
                type="url"
                value={formData.portfolio_url || ''}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.dev"
                className="w-full px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted"
              />
            </div>
          </div>
        </div>

        {/* Technical Skills Editor */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Code2 className="w-5 h-5 text-accent" />
              <span>Technical Skills</span>
            </h2>
            <span className="text-xs text-slate-400">
              {(formData.skills || []).length} Skills Added
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. TypeScript, React, System Design, PostgreSQL"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Tag list */}
          <div className="flex flex-wrap gap-2 pt-2">
            {(formData.skills || []).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-border text-accent text-xs font-semibold shadow-sm"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="hover:text-red-400 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
            {(formData.skills || []).length === 0 && (
              <p className="text-xs text-slate-500 italic">
                No technical skills added yet. Add languages, frameworks, or databases above.
              </p>
            )}
          </div>
        </div>

        {/* Education Editor */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <GraduationCap className="w-5 h-5 text-accent" />
              <span>Education Background</span>
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="px-4 py-2 rounded-full bg-surface-elevated border border-border hover:border-accent/50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-accent" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-4">
            {(formData.education || []).map((edu, index) => (
              <div
                key={index}
                className="p-5 rounded-3xl bg-surface-elevated/60 border border-border space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    Institution #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="text-slate-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      University / Institution
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(index, 'institution', e.target.value)
                      }
                      placeholder="Stanford University"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Degree / Major
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="B.S. Computer Science"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      placeholder="2024"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(formData.education || []).length === 0 && (
              <p className="text-xs text-slate-500 italic">
                No education history added yet.
              </p>
            )}
          </div>
        </div>

        {/* Experience Editor */}
        <div className="glass-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
              <Briefcase className="w-5 h-5 text-accent" />
              <span>Professional Experience</span>
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="px-4 py-2 rounded-full bg-surface-elevated border border-border hover:border-accent/50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-accent" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-4">
            {(formData.experience || []).map((exp, index) => (
              <div
                key={index}
                className="p-5 rounded-3xl bg-surface-elevated/60 border border-border space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">
                    Role #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="text-slate-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(index, 'company', e.target.value)
                      }
                      placeholder="Tech Corp"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(index, 'role', e.target.value)}
                      placeholder="Software Engineer Intern"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Duration / Dates
                    </label>
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) =>
                        updateExperience(index, 'duration', e.target.value)
                      }
                      placeholder="Summer 2023"
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Description / Key Achievements
                    </label>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) =>
                        updateExperience(index, 'description', e.target.value)
                      }
                      placeholder="Built scalable REST APIs and responsive UI components using React and TypeScript..."
                      className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-white text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(formData.experience || []).length === 0 && (
              <p className="text-xs text-slate-500 italic">
                No work experience added yet.
              </p>
            )}
          </div>
        </div>

        {/* Submit Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-sm transition-all shadow-xl hover:scale-105"
          >
            {isSaving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8">
        <JobRecommendations />
      </div>
    </div>
  );
};

